const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const source = JSON.parse(read('data/submissions-source.json'));
const { submissions } = JSON.parse(read('data/submissions.json'));
const config = JSON.parse(read('data/work-gallery.json'));
const document = {
  querySelector: () => null, querySelectorAll: () => [], getElementById: () => null,
  body: { classList: { contains: () => false } }, addEventListener() {},
};
const context = vm.createContext({ document, window: {
  matchMedia: () => ({ matches: false }), addEventListener() {},
}, fetch: () => new Promise(() => {}), console, config, submissions });
vm.runInContext(read('js/all-works.js'), context);
vm.runInContext(read('js/work-gallery.js'), context);
vm.runInContext('expandWorkGalleryConfig(config); allSubmissions = submissions;', context);
const winners = vm.runInContext('winningWorkGroups.flatMap(getGroupWorks)', context);
const representedRows = submissions.flatMap((s) => s.sourceRows || [s.sourceRow]).sort((a, b) => a - b);
assert.deepEqual(representedRows, source.map((_, i) => i + 2), 'every form row remains traceable');
assert.equal(new Set(submissions.map((s) => s.id)).size, submissions.length);
submissions.forEach((submission) => {
  const i = submission.sourceRow - 2;
  assert.equal(submission.artist, source[i][0]);
  assert.equal(submission.title, source[i][1]);
  assert.equal(submission.meaning, source[i][2] || '');
  assert.ok(submission.media.length > 0);
  assert.ok(submission.tags.length > 0);
  const ids = [...source[i][3].matchAll(/[?&]id=([\w-]+)/g)].map((m) => m[1]);
  const sourceIds = submission.sources.map((s) => s.id);
  ids.forEach((id) => assert.ok(sourceIds.includes(id), `Missing latest attachment ${id}`));
  [...submission.media, ...submission.matchedMedia, ...submission.sources.map((s) => s.path)].forEach((asset) => {
    assert.ok(asset.startsWith('imgs/works/'), asset);
    assert.ok(fs.existsSync(path.join(root, asset)), `Missing ${asset}`);
  });
  submission.awards.forEach((award) => assert.ok(winners.some((w) => w.name === award.name), award.name));
});
winners.forEach((winner) => winner.media.forEach((asset) => {
  assert.ok(submissions.some((s) => s.media.includes(asset) || s.matchedMedia.includes(asset)), `Unlinked winner ${asset}`);
}));
context.sample = submissions.find((s) => s.artist === 'Aizuo');
assert.equal(vm.runInContext('submissionMatches(sample, {artist: "aizuo"})', context), true);
assert.equal(vm.runInContext('submissionMatches(sample, {artist: "不存在的作者"})', context), false);
assert.equal(vm.runInContext('submissionMatches(sample, {title: sample.title, artist: sample.artist, tag: sample.tags[0], award: "winning"})', context), true);
assert.equal(vm.runInContext('submissionMatches(sample, {award: "other"})', context), false);
assert.equal(vm.runInContext('normalizeWorkSearch(" ＡＩＺＵＯ ")', context), 'aizuo');
const groups = JSON.parse(read('data/submission-deduplication.json')).groups;
const exclusions = JSON.parse(read('data/submission-media-exclusions.json')).exclusions;
exclusions.forEach(({ sourceRow, sourceId }) => {
  const submission = submissions.find((s) => s.sourceRow === sourceRow);
  const attachment = submission.sources.find((s) => s.id === sourceId);
  assert.ok(attachment, `Excluded attachment remains traceable: ${sourceId}`);
  assert.ok(!submission.media.includes(attachment.path), `Non-artwork hidden: ${sourceId}`);
});
assert.equal(submissions.find((s) => s.sourceRow === 59).media.length, 1);
assert.equal(submissions.find((s) => s.sourceRow === 19).media.length, 1);
assert.deepEqual(submissions.find((s) => s.sourceRow === 19).tags, ['插圖']);
assert.equal(submissions.find((s) => s.sourceRow === 93).media.length, 7);
groups.forEach(({ rows }) => {
  assert.equal(submissions.filter((s) => rows.includes(s.sourceRow)).length, 1, `Duplicate cards ${rows}`);
  const latest = submissions.find((s) => s.sourceRow === Math.max(...rows));
  assert.deepEqual(latest.sourceRows, rows);
});
assert.equal(submissions.find((s) => s.sourceRow === 141).media.length, 101, 'preserve all distinct series images');
assert.equal(submissions.find((s) => s.sourceRow === 77).media.length, 2, 'preserve distinct crops');

const mediaDuplicates = JSON.parse(read('data/submission-media-duplicates.json')).groups;
for (const group of mediaDuplicates) {
  const submission = submissions.find((s) => s.sourceRow === group.sourceRow);
  assert.ok(submission.media.includes(group.keep));
  group.duplicates.forEach((p) => assert.ok(!submission.media.includes(p)));
}
for (const [row, count] of [[3, 1], [53, 5], [71, 2], [90, 1], [37, 2]]) {
  assert.equal(submissions.find((s) => s.sourceRow === row).media.length, count, `Reviewed media count for row ${row}`);
}
context.election = submissions.find((s) => s.sourceRow === 3);
assert.equal(vm.runInContext('getAwardMedia(election.awards[0], election).includes(election.media[0])', context), true);
const series = submissions.find((s) => s.sourceRow === 141);
context.series = series;
const mappedAwards = vm.runInContext('series.awards.map((entry) => ({ name: entry.name, media: getAwardMedia(entry, series) }))', context);
assert.equal(mappedAwards.filter((a) => a.media.includes(series.media[0])).length, 1, 'first series image only shows its series award');
assert.ok(mappedAwards.some((a) => series.media.filter((p) => a.media.includes(p)).length === 101), 'series award applies to all 101 images');
assert.equal(mappedAwards.filter((a) => series.media.filter((p) => a.media.includes(p)).length === 1).length, 4, 'four individual awards each apply to their own image');
for (const award of mappedAwards) {
  assert.ok(series.media.some((p) => award.media.includes(p)), 'every award maps to a displayed image');
}
console.log(`PASS: ${submissions.length} cards, ${representedRows.length} source rows, retained attachments, ${winners.length} award entries, deduplication, search and filters.`);
