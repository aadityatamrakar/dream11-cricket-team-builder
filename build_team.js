const Shuffle = require('./lib/shuffle');
const fs = require('fs');
let contest = require('./contest.json');
let players = contest.data.site.tour.match.players;
let getRandomNo = (len) => Math.floor(Math.random() * len);
const teamScore = require('./lib/check_score');
const validateTeam = require('./lib/validate_team');
const average = (nos) => (nos.reduce((s, a) => (s += a, s), 0) / nos.length);

let matchId = contest.data.site.tour.match.id;
let tourId = contest.data.site.tour.match.tour.id;
let maxPlayerPerSquad = contest.data.site.teamCriteria.maxPlayerPerSquad;
let playerTypeRules = contest.data.site.playerTypes.map(c => ({
	name: c.id,
	min: c.minPerTeam,
	max: c.maxPerTeam
}));
let occurence = {},
	combinations = {
		id: [],
		team: []
	};

players = players.map((c, i) => {
		if (c.lineupStatus) occurence[c.id] = 0;
		return {
			id: c.id,
			credits: c.credits,
			lineupStatus: c.lineupStatus ? c.lineupStatus.status : '',
			name: c.name,
			points: c.points,
			squadName: c.squad.name,
			selectionRate: c.statistics.selectionRate,
			captainRate: c.statistics.role[0].selectionRate,
			VCRate: c.statistics.role[1].selectionRate,
			type: c.type.id,
			myid: i
		}
	})
	.filter(c => c.lineupStatus == 'PLAYING')
	.sort((a, b) => (b.selectionRate - a.selectionRate))
	.slice(0, 16);

let playerName = players.reduce((o, a) => (o[a.id] = a.name, o), {});
let playerTeam = players.reduce((o, a) => (o[a.id] = a.squadName, o), {});
let playerType = players.reduce((o, a) => (o[a.id] = a.type, o), {});
let captainRate = players.reduce((o, a) => (o.push([a.id, a.captainRate]), o), []).sort((a, b) => (b[1] - a[1])).slice(0, 5).reduce((s, c) => (s[c[0]] = 2, s), {});
let viceCaptainRate = players.reduce((o, a) => (o.push([a.id, a.VCRate]), o), []).sort((a, b) => (b[1] - a[1])).slice(0, 10).reduce((s, c) => (s[c[0]] = 2, s), {});

fs.writeFileSync('playing11.json', JSON.stringify(players, null, 2));

for (let i = 0; i < 1000; i++) {
	let team = makeTeam(players);
	let id = team.team.reduce((s, a) => (s += a, s), 0);
	if (combinations.id.indexOf(id) == -1) {
		combinations.id.push(id);
		combinations.team.push(team);
	}
}

// combinations.team = combinations.team.sort((a, b) => (b.credits - a.credits)).splice(0, 100).map(c => ([...c.team]));

combinations.team = combinations.team
	// .filter(c => c.credits == 100)
	.filter(c => (validateTeam(maxPlayerPerSquad, playerTypeRules, playerTeam, playerType, c.team)))
	.sort((a, b) => (b.points - a.points))
	.map(c => ([...c.team]))
	.splice(0, 11)

for (let i = 0; i < combinations.team.length; i++) {
	combinations.team[i].forEach(c => {
		occurence[c] += 1;
	});
}

let teamScoreAfterMatch = [];
combinations.team = combinations.team.map((c, idx) => {
	let playerSchema = c.map(p => {
		let r = {
			id: p
		};
		if (captainRate[p] && captainRate[p] > 0) r.captain = p;
		if (viceCaptainRate[p] && viceCaptainRate[p] > 0) r.vicecaptain = p;
		return r;
	});

	playerSchema = Shuffle(playerSchema);
	let selectedCaptains = 0;
	let selectedCaptainsFlag = [true, true];

	for (let i = 0; i < playerSchema.length && selectedCaptains < 2; i++) {
		if (playerSchema[i].captain && selectedCaptainsFlag[0]) {
			captainRate[playerSchema[i].id] -= 1;
			playerSchema[i].role = {
				id: 1
			};
			selectedCaptains += 1;
			selectedCaptainsFlag[0] = false;
		} else if (playerSchema[i].vicecaptain && selectedCaptainsFlag[1]) {
			viceCaptainRate[playerSchema[i].id] -= 1;
			playerSchema[i].role = {
				id: 2
			};
			selectedCaptains += 1;
			selectedCaptainsFlag[1] = false;
		}
	}

	if (playerSchema.filter(c => c.role).length != 2) {
		// console.log(playerSchema.filter(c => c.role))
		playerSchema = Shuffle(playerSchema);
		let alotCaptainId = 1;
		if (playerSchema.filter(c => c.role)[0].role.id == 1) alotCaptainId = 2;
		for (let i = 0; i < playerSchema.length; i++) {
			if(!playerSchema[i].role && (playerSchema[i].captain || playerSchema[i].vicecaptain)) {
				playerSchema[i].role = {id: alotCaptainId};
				break;
			}
		}
		// console.log(idx, playerSchema.filter(c => c.role).length);
	}

	// teamScoreAfterMatch.push(teamScore(players, playerSchema));

	playerSchema.forEach(c => (delete c.captain, delete c.vicecaptain));
	return playerSchema;
});

// console.log(teamScoreAfterMatch.sort((a, b) => (b - a)), 'Avg: ' + average(teamScoreAfterMatch.sort((a, b) => (b - a)).slice(0, 3)));
// fs.appendFileSync('points.txt', teamScoreAfterMatch.join('\n') + "\n");

console.log('Built Teams: ' + combinations.team.length);
fs.writeFileSync('teams.json', JSON.stringify(combinations.team, null, 2));
fs.writeFileSync('occurence.txt', Object.keys(occurence).sort((a, b) => (occurence[a] - occurence[b])).filter(c => occurence[c]).map(c => `${String(c).padStart(5, '-')}\t${String('').padStart(occurence[c], '-')}`).join('\n'));

function makeTeam(players) {
	players = Shuffle(players);
	let team = [];
	let credits = 100,
		points = 0;
	let lowestCredit = players.sort((a, b) => (a.credits - b.credits))[0].credits;
	let playerCredits = players.reduce((o, a) => (o[a.id] = a.credits, o), {});
	let playerPoints = players.reduce((o, a) => (o[a.id] = a.selectionRate, o), {});
	do {
		if (credits >= lowestCredit) {
			let randomPlayer;
			do {
				randomPlayer = players[getRandomNo(players.length)];
				// console.log(`RP: ${randomPlayer}`);
			} while (!randomPlayer || team.indexOf(randomPlayer.id) != -1);
			team.push(randomPlayer.id);
			credits -= randomPlayer.credits;
			points += randomPlayer.selectionRate;
		} else {
			let removedPlayer = team.splice(getRandomNo(team.length), 1);
			credits += playerCredits[removedPlayer[0]];
			points -= playerPoints[removedPlayer[0]];
		}
		// console.log(`C: ${credits} T: ${team.length}`)
	} while (team.length < 11 || credits < 0);

	return {
		team,
		credits: 100 - credits,
		points
	};
}
