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
        this.misc = [];
    }
}

/**
 * Returns `|` separted regex pattern
 * @param {String} pattern 
 */
const patternToRegExp = function (pattern) {
    if (!Array.isArray(pattern)) {
      return patternToRegExp([pattern]);
    }
    return new RegExp([
      '^',
      pattern.join('|')
    ].join(''), 'gi');
};

/**
 * 
 * @param {String} commitMessage 
 */
const checkCommitType = function (commitMessage){
    const choreRegex = patternToRegExp(['chore:', 'chore\\([0-9a-zA-Z-_.]*\\):']);
    const featRegex = patternToRegExp(['feat:', 'feat\\([0-9a-zA-Z-_.]*\\):']);
    const fixRegex = patternToRegExp(['fix:', 'fix\\([0-9a-zA-Z-_.]*\\):']);
    if (choreRegex.test(commitMessage)){
        return 'chore';
    } else if (featRegex.test(commitMessage)){
        return 'feat';
    } else if (fixRegex.test(commitMessage)) {
        return 'fix';
    } else {
        return 'misc';
    }
};

/**
 * Appends content to file (fileName)
 * @param {String} fileName
 * @param {String} content 
 */
const appendToFileSync = (fileName, content) => {
    let lineToBeAppended = content;
    fs.appendFileSync(fileName, lineToBeAppended);
    console.log(lineToBeAppended);
}

const tagCollection = [];
const suffixers = ['chore(): ', 'chore: ', 'chore(xyz): ', 'fix(): ', 'fix: ', 'fix(xyz): ', 'perf(): ', 'perf: ', 'perf(xyz): ', ''];
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
        if (tagFlag){
            tagCollection.push(tagDoc);
        }
        tagDoc = new Tag(line);
        tagFlag = true;
    } else {
        if (line.length != 0){
            let suffixer = suffixers[Math.floor(Math.random()*suffixers.length)];
            let tempLine = suffixer + line;
            if (tagFlag) {
                switch (checkCommitType(tempLine)) {
                    case 'chore':
                        tagDoc.internalChanges.push(line);
                        break;
                    case 'fix':
                        tagDoc.bugs.push(line);
                        break;
                    case 'feat':
                        tagDoc.features.push(line);
                        break;
                    default:
                        tagDoc.misc.push(line);
                }
            }
        }
    }
});

rl.on('close', ()=> {
    console.log(tagCollection);
    for (tag of tagCollection){
        appendToFileSync('CHANGELOG.md', toTitle(tag.tagNumber));
        if (tag.features.length){
            appendToFileSync('CHANGELOG.md', toTitle('Features', 3));
            for (feature of tag.features){
                appendToFileSync('CHANGELOG.md', toBullet(feature));
            }
        }
        if (tag.bugs.length){
            appendToFileSync('CHANGELOG.md', toTitle('Bug Fixes', 3));
            for (bug of tag.bugs){
                appendToFileSync('CHANGELOG.md', toBullet(bug));
            }
        }
        if (tag.internalChanges.length){
            appendToFileSync('CHANGELOG.md', toTitle('Internal Changes', 3));
            for (change of tag.internalChanges){
                appendToFileSync('CHANGELOG.md', toBullet(change));
            }
        }
        if (tag.misc.length){
            for (commit of tag.misc){
                appendToFileSync('CHANGELOG.md', toBullet(commit));
            }
        }
    }
});