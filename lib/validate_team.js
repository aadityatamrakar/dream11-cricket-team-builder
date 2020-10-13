function validateTeam(maxPerSquad, playerRules, playerTeam, playerType, lineUp) {
	let flag = true;

	let maxSquadInLineUp = lineUp.reduce((s, p) => {
		if (s[playerTeam[p]]) s[playerTeam[p]] += 1;
		else s[playerTeam[p]] = 1;
		return s;
	}, {});
	maxSquadInLineUp = Object.values(maxSquadInLineUp);

	if (maxSquadInLineUp.some(c => c > maxPerSquad)) {
		flag = false;
		// console.log('MaxSquad: ' + flag, maxSquadInLineUp);
	}


	let playerTypeInLineUp = lineUp.reduce((s, p) => {
		if (s[playerType[p]]) s[playerType[p]] += 1;
		else s[playerType[p]] = 1;
		return s;
	}, {});

	// console.log(playerTypeInLineUp);
	playerTypeInLineUp['AR'] = playerTypeInLineUp['ALL'];

	for (let i = 0; i < playerRules.length && flag; i++) {
		let count = playerTypeInLineUp[playerRules[i].name] ? playerTypeInLineUp[playerRules[i].name] : 0;
		if (playerRules[i].max < count) {
			// console.log(playerRules[i].name, playerRules[i].max, playerRules[i].min, count);
			flag = false;
			break;
		}
		if (playerRules[i].min > count) {
			// console.log(playerRules[i].name, playerRules[i].max, playerRules[i].min, count);
			flag = false;
			break;
		}
	}
	// console.log('Player Type: ' + flag);

	return flag;
}

module.exports = validateTeam;