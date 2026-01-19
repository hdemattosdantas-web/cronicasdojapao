export interface TimeSystem {
  currentYear: number
  currentSeason: 'spring' | 'summer' | 'autumn' | 'winter'
  currentMonth: number
}

export interface AgeEvent {
  age: number
  title: string
  description: string
  choices: Choice[]
}

export interface Choice {
  text: string
  consequence: string
  effects: {
    health?: number
    honor?: number
    gold?: number
    strength?: number
    agility?: number
    intelligence?: number
    charisma?: number
  }
}

export class GameTime {
  static readonly SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const
  static readonly SEASON_NAMES = {
    spring: 'Primavera',
    summer: 'Verão', 
    autumn: 'Outono',
    winter: 'Inverno'
  }

  static getCurrentTime(character: any): TimeSystem {
    const yearsPassed = character.current_year - character.birth_year
    const currentSeason = this.getSeason(yearsPassed)
    const currentMonth = (yearsPassed % 12) + 1

    return {
      currentYear: character.current_year,
      currentSeason,
      currentMonth
    }
  }

  static getSeason(yearsPassed: number): 'spring' | 'summer' | 'autumn' | 'winter' {
    const seasonIndex = yearsPassed % 4
    return this.SEASONS[seasonIndex] as 'spring' | 'summer' | 'autumn' | 'winter'
  }

  static advanceTime(character: any, months: number = 1): any {
    const newYear = character.current_year + Math.floor(months / 12)
    const newAge = character.age + Math.floor(months / 12)
    
    return {
      ...character,
      current_year: newYear,
      age: newAge,
      is_alive: newAge < 80, // Morte natural aos 80 anos
      death_reason: newAge >= 80 ? 'velhice' : character.death_reason
    }
  }

  static getAgeEvents(age: number): AgeEvent[] {
    const events: AgeEvent[] = []

    // Eventos por idade
    if (age === 16) {
      events.push({
        age: 16,
        title: 'Cerimônia de Maioridade',
        description: 'Você completou 16 anos e está pronto para se tornar um guerreiro. Seu clã organiza uma cerimônia para marcar sua transição para a vida adulta.',
        choices: [
          {
            text: 'Dedicar-se ao treinamento de espada',
            consequence: 'Você se torna um espadachim habilidoso, mas negligencia seus estudos.',
            effects: { strength: 5, intelligence: -2 }
          },
          {
            text: 'Estudar estratégia com os anciãos',
            consequence: 'Você se torna um estrategista brilhante, mas sua força física fica aquém do esperado.',
            effects: { intelligence: 5, strength: -2 }
          },
          {
            text: 'Equilibrar treinamento e estudos',
            consequence: 'Você se torna um guerreiro completo, embora não se destaque em nenhuma área específica.',
            effects: { strength: 2, intelligence: 2 }
          }
        ]
      })
    }

    if (age === 20) {
      events.push({
        age: 20,
        title: 'Primeira Batalha',
        description: 'Seu clã está em conflito com um clã rival. Esta é sua primeira verdadeira batalha como samurai.',
        choices: [
          {
            text: 'Lutar na linha de frente',
            consequence: 'Sua coragem é notada, mas você sofre ferimentos graves.',
            effects: { honor: 10, health: -20 }
          },
          {
            text: 'Atuar como arqueiro de apoio',
            consequence: 'Você contribui para a vitória sem se expor demais.',
            effects: { honor: 5, health: -5 }
          },
          {
            text: 'Proteger o comandante',
            consequence: 'Sua lealdade é recompensada com promoção.',
            effects: { honor: 15, gold: 20 }
          }
        ]
      })
    }

    if (age === 25) {
      events.push({
        age: 25,
        title: 'Casamento Arranjado',
        description: 'Seu clã propõe um casamento estratégico com outro clã para fortalecer alianças.',
        choices: [
          {
            text: 'Aceitar o casamento',
            consequence: 'A aliança fortalece seu clã, mas você sacrifica seu amor pessoal.',
            effects: { honor: 10, charisma: 3 }
          },
          {
            text: 'Recusar educadamente',
            consequence: 'Você mantém sua liberdade, mas desagrada alguns anciãos.',
            effects: { honor: -5, charisma: 5 }
          },
          {
            text: 'Negociar melhores termos',
            consequence: 'Você demonstra sabedoria política e obtém vantagens.',
            effects: { intelligence: 5, gold: 30 }
          }
        ]
      })
    }

    // Eventos de meia-idade
    if (age === 35) {
      events.push({
        age: 35,
        title: 'Posição de Liderança',
        description: 'Sua experiência e reputação lhe rendem uma posição de liderança no clã.',
        choices: [
          {
            text: 'Aceitar o cargo de comandante',
            consequence: 'Você se torna um líder respeitado, mas o peso da responsabilidade é grande.',
            effects: { honor: 20, health: -10 }
          },
          {
            text: 'Tornar-se conselheiro',
            consequence: 'Você influencia as decisões sem o fardo do comando direto.',
            effects: { intelligence: 10, honor: 10 }
          },
          {
            text: 'Recusar para manter liberdade',
            consequence: 'Você prefere a liberdade do campo de batalha à política.',
            effects: { strength: 5, charisma: -5 }
          }
        ]
      })
    }

    // Eventos de velhice
    if (age === 50) {
      events.push({
        age: 50,
        title: 'Herdeiro',
        description: 'Seus filhos já cresceram e estão prontos para seguir seus passos.',
        choices: [
          {
            text: 'Treinar seu filho mais velho',
            consequence: 'Seu filho se torna um guerreiro digno de seu legado.',
            effects: { honor: 15, charisma: 5 }
          },
          {
            text: 'Deixar os filhos escolherem seus caminhos',
            consequence: 'Seus filhos encontram seus próprios destinos.',
            effects: { intelligence: 5, honor: 5 }
          },
          {
            text: 'Aposentar-se e meditar',
            consequence: 'Você encontra paz interior na velhice.',
            effects: { health: 20, intelligence: 10 }
          }
        ]
      })
    }

    return events
  }

  static checkDeath(character: any): { isDead: boolean; reason?: string } {
    if (character.age >= 80) {
      return { isDead: true, reason: 'velhice' }
    }

    if (character.health <= 0) {
      return { isDead: true, reason: 'ferimentos' }
    }

    // Morte aleatória baseada na idade
    if (character.age >= 60) {
      const deathChance = (character.age - 60) * 0.01
      if (Math.random() < deathChance) {
        const reasons = ['doença', 'acidente', 'envenenamento']
        return { 
          isDead: true, 
          reason: reasons[Math.floor(Math.random() * reasons.length)]
        }
      }
    }

    return { isDead: false }
  }
}
