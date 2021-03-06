require('dotenv').config();
const fs = require('fs'),
	formatJSFile = require('../utils/prettier'),
	github = require('./github'),
	ora = require('../utils/ora'),
	codewars = require('../utils/codewars');

const { DIR_PATH } = process.env;

module.exports = {
	createKatas: function(katas) {
		return new Promise(async function(resolve) {
			for (let kata of katas) {
				const spinner = ora.createSpinner(),
					{ kataLevel, kataTitle, kataLink, solutionsArr } = kata,
					dirPath = `${DIR_PATH}/${kataLevel}`,
					folderExists = await checkPath(dirPath);

				if (!folderExists) {
					await createDirectory(dirPath);
					spinner.info(`Added a directory for level ${kataLevel} katas!`);
				}

				let version = 1;
				for (let i = solutionsArr.length - 1; i >= 0; i--) {
					const fileExtension = getFileExtension(solutionsArr[i].language);
					if (
						i !== solutionsArr.length - 1 &&
						solutionsArr[i].language === solutionsArr[i + 1].language
					) {
						version++;
					} else {
						version = 1;
					}

					const filePath = `${dirPath}/${kataTitle}_v${version}${fileExtension}`;

					let payload = `${solutionsArr[i].code}\n`;

					if (fileExtension === '.js') {
						payload = formatJSFile(payload);
					}

					const fileExists = await checkPath(filePath);

					if (!fileExists) {
						const kataFileName = `${kataTitle}_v${version}${fileExtension}`;

						await createFile(filePath, payload);
						await github.commitChanges(filePath, `Completed ${kataTitle}`);

						spinner.succeed(
							`${kataFileName} has been saved locally and commited to git!`
						);
					}
				}
			}

			resolve('Done');
		});
	},
	createReadme: function() {
		return new Promise(async function(resolve) {
			const spinner = ora.createSpinner(),
				readmePath = `${DIR_PATH}/README.md`,
				readmeExists = await checkPath(readmePath);

			var message = !readmeExists
				? 'Added README.md file!'
				: 'Updated README.md file!';

			codewars(async function(userInfo) {
				var skills = '',
					languages = userInfo.ranks.languages;

				for (let language in languages) {
					skills +=
						`### ${language}\n` +
						`#### Rank - ${languages[language].name} / Score - ${
							languages[language].score
						}\n`;
				}

				var readmeContents =
					'## :trident: Codewars Challenge Repo\n' +
					'![Badge](https://www.codewars.com/users/scottworks/badges/large)\n' +
					`### :wolf: Clan: ${userInfo.clan}\n` +
					'## :zap: Skills\n' +
					`${skills}\n` +
					'## :chart_with_upwards_trend: Stats\n' +
					`### :trophy: Leaderboard Position - ${
						userInfo.leaderboardPosition
					}\n` +
					`### :pencil2: Authored Challenges - ${
						userInfo.codeChallenges.totalAuthored
					}\n` +
					`### :muscle: Completed Challenges - ${
						userInfo.codeChallenges.totalCompleted
					}\n`;

				await createFile(readmePath, readmeContents);
			});

			await github.commitChanges(readmePath, message);

			if (!readmeExists) spinner.info(message);

			resolve('Done');
		});
	}
};

function checkPath(path) {
	return new Promise((resolve) => {
		resolve(fs.existsSync(path));
	});
}

function createDirectory(dirPath) {
	return new Promise((resolve) => {
		resolve(
			fs.mkdirSync(dirPath, (err) => {
				if (err) {
					throw err;
				}
			})
		);
	});
}

function createFile(filePath, payload) {
	return new Promise((resolve) => {
		resolve(
			fs.writeFileSync(filePath, payload, (err) => {
				if (err) {
					throw err;
				}
			})
		);
	});
}

function getFileExtension(language) {
	switch (language) {
	case 'Go':
		return '.go';
	case 'JavaScript':
		return '.js';
	case 'TypeScript':
		return '.ts';
	case 'SQL':
		return '.sql';
	case 'Java':
		return '.java';
	case 'C++':
		return '.cpp';
	case 'BF':
		return '.bf';
	case 'C':
		return '.c';
	case 'Clojure':
		return '.clj';
	case 'CoffeeScript':
		return '.coffee';
	case 'Crystal':
		return '.cr';
	case 'C#':
		return '.cs';
	case 'Dart':
		return '.dart';
	case 'Elixir':
		return '.ex';
	case 'Elm':
		return '.elm';
	case 'Erlang':
		return '.erl';
	case 'Fortran':
		return '.f';
	case 'F#':
		return '.fs';
	case 'Groovy':
		return '.groovy';
	case 'Haskell':
		return '.hs';
	case 'Julia':
		return '.jl';
	case 'Kotlin':
		return '.kt';
	case 'Lua':
		return '.lua';
	case 'NASM':
		return '.exe'; // unsure on this one
	case 'Nim':
		return '.nim';
	case 'Objective-C':
		return '.h';
	case 'OCaml':
		return '.ml';
	case 'PHP':
		return '.php';
	case 'PowerShell':
		return '.ps1';
	case 'PureScript':
		return '.purs';
	case 'Python':
		return '.py';
	case 'R':
		return '.r';
	case 'Ruby':
		return '.rb';
	case 'Rust':
		return '.rs';
	case 'Scala':
		return '.scala';
	case 'Shell':
		return '.sh';
	case 'Solidity':
		return '.solidity';
	case 'Swift':
		return '.swift';
	case 'Chapel':
		return '.chpl';
	case 'CSS3':
		return '.css';
	case 'D':
		return '.d';
	case 'Lisp':
		return '.lsp';
	case 'Perl':
		return '.pl';
	case 'Racket':
		return '.rkt';
	case 'Sass':
		return '.sass';
	default:
		return '';
	}
}
