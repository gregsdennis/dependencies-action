const evaluate = require('./evaluate-dependencies');

process.env.GITHUB_REPOSITORY = 'owner/repo';

const shorthand = 'Depends on #14'
test('Shorthand', () => {
    expect(evaluate.getAllDependencies(shorthand))
        .toStrictEqual([{
            owner: 'owner',
            repo: 'repo',
            pull_number: 14
        }]);
});

const partialLink = 'Depends on gregsdennis/dependencies-action#5'
test('partialLink', () => {
    expect(evaluate.getAllDependencies(partialLink))
        .toStrictEqual([{
            owner: 'gregsdennis',
            repo: 'dependencies-action',
            pull_number: 5
        }]);
});

const shorthandAndPartialLink = `Depends on #14
Depends on gregsdennis/dependencies-action#5`
test('shorthandAndPartialLink', () => {
    expect(evaluate.getAllDependencies(shorthandAndPartialLink))
        .toStrictEqual([{
            owner: 'owner',
            repo: 'repo',
            pull_number: 14
        },{
            owner: 'gregsdennis',
            repo: 'dependencies-action',
            pull_number: 5
        }]);
});

const shorthandAndPartialLinkWithBlankLineAtEnd = `Depends on #14
Depends on gregsdennis/dependencies-action#5
`
test('shorthandAndPartialLinkWithBlankLineAtEnd', () => {
    expect(evaluate.getAllDependencies(shorthandAndPartialLinkWithBlankLineAtEnd))
        .toStrictEqual([{
            owner: 'owner',
            repo: 'repo',
            pull_number: 14
        },{
            owner: 'gregsdennis',
            repo: 'dependencies-action',
            pull_number: 5
        }]);
});

const shorthandAndPartialLinkWithBlankLineInMiddle = `Depends on #14

Depends on gregsdennis/dependencies-action#5`
test('shorthandAndPartialLinkWithBlankLineInMiddle', () => {
    expect(evaluate.getAllDependencies(shorthandAndPartialLinkWithBlankLineInMiddle))
        .toStrictEqual([{
            owner: 'owner',
            repo: 'repo',
            pull_number: 14
        },{
            owner: 'gregsdennis',
            repo: 'dependencies-action',
            pull_number: 5
        }]);
});
