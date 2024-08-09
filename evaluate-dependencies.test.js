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

const multipleInDashBulletedListWithMixedLinkTypes = `- Blocked by: https://github.com/username/action_docker/pull/1
- Blocked by: https://github.com/username/action_bump/pull/1
- Blocked By https://github.com/username/action_python/pull/1
- Blocked By: https://github.com/username/action_pull_requests/pull/1
- Related: https://github.com/username/dependencies-action/issues/28
- Related: #213 
- Related: #214 `
test('multipleInDashBulletedListWithMixedLinkTypes', () => {
    expect(evaluate.getAllDependencies(multipleInDashBulletedListWithMixedLinkTypes))
        .toStrictEqual([{
            owner: 'username',
            repo: 'action_docker',
            pull_number: 1
        },{
            owner: 'username',
            repo: 'action_bump',
            pull_number: 1
        },{
            owner: 'username',
            repo: 'action_python',
            pull_number: 1
        },{
            owner: 'username',
            repo: 'action_pull_requests',
            pull_number: 1
        }]);
});

const multipleInStarBulletedListWithMixedLinkTypes = `* Blocked by: https://github.com/username/action_docker/pull/1
* Blocked by: https://github.com/username/action_bump/pull/1
* Blocked By https://github.com/username/action_python/pull/1
* Blocked By: https://github.com/username/action_pull_requests/pull/1
* Related: https://github.com/username/dependencies-action/issues/28
* Related: #213 
* Related: #214 `
test('multipleInStarBulletedListWithMixedLinkTypes', () => {
    expect(evaluate.getAllDependencies(multipleInStarBulletedListWithMixedLinkTypes))
        .toStrictEqual([{
            owner: 'username',
            repo: 'action_docker',
            pull_number: 1
        },{
            owner: 'username',
            repo: 'action_bump',
            pull_number: 1
        },{
            owner: 'username',
            repo: 'action_python',
            pull_number: 1
        },{
            owner: 'username',
            repo: 'action_pull_requests',
            pull_number: 1
        }]);
});
