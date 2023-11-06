import { aseSocket } from "../aseSockets.js";
import * as utilFunctions from "../utilityFunctions.js";
import { localize } from "@typhonjs-fvtt/runtime/svelte/helper";

export async function MissileChatBuilder(data) {
    let content = `<table id="ASEmissileDialogChatTable"><tr><th style="text-align: center;">${localize("ASE.Target")}</th><th style="text-align: center;">Hit / Miss</th><th style="text-align: center;">${localize("ASE.AttackRoll")}</th><th style="text-align: center;">${localize("ASE.DamageRoll")}</th>`;
    let rolls = data.rolls;
    console.log("ASE: Missile Chat Builder: Data", data);
    console.log("ASE: Missile Chat Builder: Rolls", rolls);
    //build content table using rolls data
    for (let i = 0; i < rolls.length; i++) {
        let currAttackRoll = rolls[i].attackRoll;
        let currDamageRoll = rolls[i].damageRoll ?? {};
        let currTarget = rolls[i].target;
        let currTargetName = currTarget.name;
        let hit = !currAttackRoll ? true : rolls[i].hit;
        let currAttackBreakDown = '';
        let currDamageBreakdown = '';
        let damageTotalText = '';
        if(currAttackRoll){
            if(currAttackRoll.hasAdvantage || currAttackRoll.hasDisadvantage) {
                let advantageText = '';
                currAttackRoll.dice[0].results.forEach(result => {
                    //add result.result to advantageText with comma 
                    advantageText += result.result + ', ';
                });
                //remove last comma
                advantageText = advantageText.slice(0, -2);
                currAttackBreakDown = `[${currAttackRoll.hasAdvantage ? 'Advantage' : 'Disadvantage'} : ${advantageText}] - [${currAttackRoll.result}]`;
            } else {
                currAttackBreakDown = `[${currAttackRoll.result}]`;
            }
    
            if (currDamageRoll.isCritical) {
                currAttackRoll._total = `Critical!`;
            }
        } else {
            currAttackBreakDown = "NO ROLL";
            currAttackRoll = {_total: " - "};
        }
        
        if(hit){
            currDamageBreakdown = `${currDamageRoll.formula} : ${currDamageRoll.result}`;
            damageTotalText = currDamageRoll.total;
        } else {
            currDamageBreakdown = `NO ROLL`;
            damageTotalText = ` - `;
        }
        content += `<tr><td style="text-align: center;"><figure style="overflow: auto;"><img style="float: top; border:0;" alt="Token" src="${currTarget.document.texture.src}" height="40"><figcaption style="white-space: nowrap;margin:0">${currTargetName}</figcaption></figure></td><td style="text-align: center;">${hit ? "Hit" : "Miss"}</td><td style="text-align: center;" title = '${currAttackBreakDown}'>${currAttackRoll._total}</td><td style="text-align: center;" title = '${currDamageBreakdown}'>${damageTotalText}</td></tr>`;
    }
    

    return content;
}
