const readline = require('readline');
const fs = require('fs');
const os = require('os');

const rl = readline.createInterface({
    input: fs.createReadStream('sample.txt'),
    crlfDelay: Infinity
});

/**
 * Checks whether a particular string is in semver format or not
 * @param {String} commitMessage
 */
const isSemver = (commitMessage) => {
    const semverRegex = new RegExp('^[0-9]+\.[0-9]+\.[0-9]+$', 'g');
    let result = semverRegex.test(commitMessage);
    return result;
};

/**
 * Converts string to title in markdown format
 * @param {String} title
 * @param {Number} size
 */
const toTitle = (title, size = 2) => {
    let titleHash = '';
    for (let i = 0; i<size ;i++){
        titleHash += '#';
    }
    return `${titleHash} ${title} \n`;
}

/**
 * Converts string to bullet content in markdown format
 * @param {String} content
 */
const toBullet = (content) => {
    return `- ${content} \n`;
}

/**
 * Tag Class
 */
class Tag {
    constructor(tagNumber){
        this.tagNumber = tagNumber;
        this.bugs = [];
        this.internalChanges = [];
        this.features = [];
    }
}

const tagCollection = [];
fs.unlink('CHANGELOG.md', (err) => {
    if (err) {
        console.log("WTF!!")
    }
    console.log('CHANGELOG.md was deleted');
});
let tagFlag = false;
let tagDoc;

rl.on('line', (line) => {
    let isTagCommit = isSemver(line);
    let lineToBeAppended;
    if (isTagCommit) {
        // lineToBeAppended = toTitle(line);
        // fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
        // console.log(`## ${line}`);
        if (tagFlag){
            tagCollection.push(tagDoc);
        }
        tagDoc = new Tag(line);
        tagFlag = true;
    } else {
        if (line.length != 0){
            // lineToBeAppended = toBullet(line);
            // fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
            // console.log(`- ${line}`);
            if (tagFlag){
                tagDoc.features.push(line);
            }
        }
    }
});

rl.on('close', ()=> {
    for (tag of tagCollection){
        let lineToBeAppended = toTitle(tag.tagNumber);
        fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
        console.log(lineToBeAppended);
        if (tag.features.length){
            lineToBeAppended = toTitle('Features', 3);
            fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
            console.log(lineToBeAppended);
            for (feature of tag.features){
                lineToBeAppended = toBullet(feature);
                fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
                console.log(lineToBeAppended);
            }
        }
        if (tag.bugs.length){
            lineToBeAppended = toTitle('Bug', 3);
            fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
            console.log(lineToBeAppended);
            for (bug of tag.bugs){
                lineToBeAppended = toBullet(bug);
                fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
                console.log(lineToBeAppended);
            }
        }
        if (tag.internalChanges.length){
            lineToBeAppended = toTitle('Internal Changes', 3);
            fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
            console.log(lineToBeAppended);
            for (change of tag.internalChanges){
                lineToBeAppended = toBullet(change);
                fs.appendFileSync('CHANGELOG.md', lineToBeAppended);
                console.log(lineToBeAppended);
            }
        }
    }
});