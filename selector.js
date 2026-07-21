const pairs = {
  "Elvish Heartwood": "Dwarven Forge",
  "Dwarven Forge": "Elvish Heartwood",
  "Cursed Forge": "Dwarven Mines",
  "Dwarven Mines": "Cursed Forge",
  "Gates of Hell": "Temple of the Abyss",
  "Temple of the Abyss": "Gates of Hell",
  "Dragon Aerie": "Crystal Keep",
  "Crystal Keep": "Dragon Aerie",
  "Sacred Grove": "Alchemist's Tower",
  "Alchemist's Tower": "Sacred Grove",
  "Sacrificial Pit": "Catacombs of the Dead",
  "Catacombs of the Dead": "Sacrificial Pit",
  "Dragon's Lair": "Sorcerer's Bestiary",
  "Sorcerer's Bestiary": "Dragon's Lair",
  "Sunken Reef": "Coral Castle",
  "Coral Castle": "Sunken Reef",
  "Mystical Menagerie": "Alchemical Workshop",
  "Alchemical Workshop": "Mystical Menagerie",
  "Blood Isle": "Pearl Bed",
  "Pearl Bed": "Blood Isle",
  "Druid Circle": "Dragon's Cave",
  "Dragon's Cave": "Druid Circle",
}

let weights = {
  "Elvish Heartwood": 10,
  "Dwarven Forge": 10,
  "Cursed Forge": 1,
  "Dwarven Mines": 10,
  "Gates of Hell": 10,
  "Temple of the Abyss": 10,
  "Dragon Aerie": 10,
  "Crystal Keep": 5,
  "Sacred Grove": 1,
  "Alchemist's Tower": 0,
  "Sacrificial Pit": 1,
  "Catacombs of the Dead": 10,
  "Dragon's Lair": 5,
  "Sorcerer's Bestiary": 3,
  "Sunken Reef": 10,
  "Coral Castle": 1,
  "Mystical Menagerie": 10,
  "Alchemical Workshop": 10,
  "Blood Isle": 10,
  "Pearl Bed": 10,
  "Druid Circle": 10,
  "Dragon's Cave": 10,
}

let count = 5

function select() {
  let selections = []
  let workingSet = []
  Object.keys(weights).forEach((pop)=>{ workingSet.push(pop)})
  // console.log(`Initial Set: ${JSON.stringify(workingSet)}`)
  for(let c = 0; c < count; c++) {
    let tickets = []
    workingSet.forEach((pop)=>{
      for(let i = 0; i < weights[pop]; i++) {
        tickets.push(pop)
      }
    })
    const winner = Math.floor(Math.random()*tickets.length)
    selections.push(tickets[winner])
    // console.log(`Winner: ${tickets[winner]}`)
    // console.log(`Opposed: ${pairs[tickets[winner]]}`)
    workingSet.splice(workingSet.findIndex(p => p === tickets[winner]),1)
    workingSet.splice(workingSet.findIndex(p => p === pairs[tickets[winner]]),1)
    // console.log(`New Working Set: ${JSON.stringify(workingSet)}`)
  }
  return selections
}

console.log(JSON.stringify(select()))