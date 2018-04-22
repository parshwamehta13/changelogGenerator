const readline = require('readline');
const fs = require('fs');
const os = require('os');

const rl = readline.createInterface({
    input: fs.createReadStream('sample.txt'),
    crlfDelay: Infinity
});

const isSemver = (commitMessage) => {
    const semverRegex = new RegExp('^[0-9]+\.[0-9]+\.[0-9]+$', 'g');
    let result = semverRegex.test(commitMessage);
    return result;
};

fs.unlink('CHANGELOG.md');

rl.on('line', (line) => {
    let isTagCommit = isSemver(line);
    let lineToBeAppended;
    if (isTagCommit) {
        lineToBeAppended = `## ${line} \n`;
        fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
        console.log(`## ${line}`);
    } else {
        if (line.length != 0){
            lineToBeAppended = `- ${line} \n`;
            fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
            console.log(`- ${line}`);
        }
    }
});