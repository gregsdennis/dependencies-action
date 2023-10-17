const evaluate = require('./evaluate-dependencies');

process.env.GITHUB_REPOSITORY = 'owner/repo';

const shorthand = 'Depends on #14'
test('Shorthand', () => {
    expect(evaluate.getDependency(shorthand))
        .toStrictEqual({
            owner: 'owner',
            repo: 'repo',
            pull_number: 14
        });
});

const partialLink = 'Depends on gregsdennis/dependencies-action#5'
test('partialLink', () => {
    expect(evaluate.getDependency(partialLink))
        .toStrictEqual({
            owner: 'gregsdennis',
            repo: 'dependencies-action',
            pull_number: 5
        });
});

const shorthandAndPartialLink = `Depends on #14
Depends on gregsdennis/dependencies-action#5`
test('shorthandAndPartialLink', () => {
    var lines = shorthandAndPartialLink.split(/\r\n|\r|\n/);
    expect(evaluate.getDependency(lines[0]))
        .toStrictEqual({
            owner: 'owner',
            repo: 'repo',
            pull_number: 14
        });
    expect(evaluate.getDependency(lines[1]))
        .toStrictEqual({
            owner: 'gregsdennis',
            repo: 'dependencies-action',
            pull_number: 5
        });
});

const shorthandAndPartialLinkWithBlankLineAtEnd = `Depends on #14
Depends on gregsdennis/dependencies-action#5
`
test('shorthandAndPartialLinkWithBlankLineAtEnd', () => {
    var lines = shorthandAndPartialLinkWithBlankLineAtEnd.split(/\r\n|\r|\n/);
    expect(evaluate.getDependency(lines[0]))
        .toStrictEqual({
            owner: 'owner',
            repo: 'repo',
            pull_number: 14
        });
    expect(evaluate.getDependency(lines[1]))
        .toStrictEqual({
            owner: 'gregsdennis',
            repo: 'dependencies-action',
            pull_number: 5
        });
});

const shorthandAndPartialLinkWithBlankLineInMiddle = `Depends on #14

Depends on gregsdennis/dependencies-action#5`
test('shorthandAndPartialLinkWithBlankLineInMiddle', () => {
    var lines = shorthandAndPartialLinkWithBlankLineInMiddle.split(/\r\n|\r|\n/);
    expect(evaluate.getDependency(lines[0]))
        .toStrictEqual({
            owner: 'owner',
            repo: 'repo',
            pull_number: 14
        });
    expect(evaluate.getDependency(lines[1]))
        .toStrictEqual({
            owner: 'gregsdennis',
            repo: 'dependencies-action',
            pull_number: 5
        });
});
