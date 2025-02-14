// src/composables/AppTest.ts
import {  PresetOmikenType } from '@type';

// JSONデータ作成用ファイルです

const apple: PresetOmikenType = {
 id: 'presettest',
 name: 'presettest',
 description: '用',
 version: '0.0.0',
 item: {
  types: {
   comment: ['1731155583720-5poc7', '1731154889231-34wxy', '1731148078732-vs09v', '1730455954261-hi5sb'],
   timer: [],
   unused: [],
   meta: [],
   waitingList: [],
   setList: [],
   reactions: []
  },
  rules: {
   '1731155583720-5poc7': {
    id: '1731155583720-5poc7',
    name: '初見詐欺',
    description: '',
    color: '#4527A0',
    enableIds: ['1731155764248-k28me', '1731156395590-mupgd', '1731156509378-04ync'],
    threshold: [
     {
      conditionType: 'match',
      match: {
       target: 'comment',
       case: 'starts',
       value: ['初見', 'しょけん', '所見', 'syoken', 'はじめまして']
      }
     },
     {
      conditionType: 'count',
      count: {
       comparison: 'max',
       unit: 'tc',
       value1: 6,
       value2: 1
      }
     }
    ]
   },
   '1731154889231-34wxy': {
    id: '1731154889231-34wxy',
    name: 'ギフト',
    description: '',
    color: '#FFEB3B',
    enableIds: ['1731155125168-cfu88', '1731155030049-srmcn', '1731155187246-xn0mv', '1731155301283-ro22u'],
    threshold: []
   },
   '1731148078732-vs09v': {
    id: '1731148078732-vs09v',
    name: '初見',
    description: '',
    color: '#4CAF50',
    enableIds: [
     '1731148126492-sqbn5',
     '1731149012459-vcc4r',
     '1730456695760-5zb8i',
     '1730456872841-c9gwr',
     '1731149419725-o1ebm',
     '1731149560925-musjw'
    ],
    threshold: []
   },
   '1730455954261-hi5sb': {
    id: '1730455954261-hi5sb',
    name: 'コメント数チェック',
    description: '',
    color: '#3F51B5',
    enableIds: ['1730456057476-pw29g', '1730456230208-vqklr', '1730456354800-4sj0v'],
    threshold: []
   }
  },
  omikujis: {
   '1730456057476-pw29g': {
    id: '1730456057476-pw29g',
    name: '配信枠:100回',
    description: 'その配信枠のコメント数が100ごとに反応します',
    rank: 0,
    weight: 1,
    threshold: [],
    status: '',
    placeIds: [],
    post: [
     {
      type: 'onecomme',
      botKey: 'reimu',
      iconKey: 'joy01',
      delaySeconds: 0,
      content: 'この配信の<<lc>>回目のコメントは、<<user>>さんだよ。'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!ニュースタイトル表示3'
     }
    ]
   },
   '1730456230208-vqklr': {
    id: '1730456230208-vqklr',
    name: '配信枠:200回',
    description: 'その配信枠のコメント数が200ごとに反応します',
    rank: 0,
    weight: 20,
    threshold: [],
    status: '',
    placeIds: [],
    post: [
     {
      type: 'onecomme',
      botKey: 'marisa',
      iconKey: 'fun03',
      delaySeconds: 0,
      content: 'この配信の<<lc>>回目のコメントは、<<user>>さんだぜ。'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!ニュースタイトル表示3'
     }
    ]
   },
   '1730456354800-4sj0v': {
    id: '1730456354800-4sj0v',
    name: '個人総合:100',
    description: '個人の総合コメント数が100ごとに反応します',
    rank: 0,
    weight: 8,
    threshold: [],
    status: '',
    placeIds: [],
    post: [
     {
      type: 'onecomme',
      botKey: 'reimu',
      iconKey: 'joy02',
      delaySeconds: 0,
      content: '<<user>>さんのコメントが、<<tc>>回になったわ。たくさんのコメント、ありがとう！'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!ニュースタイトル表示3'
     }
    ]
   },
   '1730456695760-5zb8i': {
    id: '1730456695760-5zb8i',
    name: '久しぶり1',
    description: '',
    rank: 0,
    weight: 3,
    threshold: [],
    status: '',
    placeIds: ['1730456801704-8lpzk'],
    post: [
     {
      type: 'onecomme',
      botKey: 'reimu',
      iconKey: 'joy01',
      delaySeconds: 0,
      content: '<<user>>さん<<WelcomeAgain01>>'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!シーン切り替え1'
     }
    ]
   },
   '1730456872841-c9gwr': {
    id: '1730456872841-c9gwr',
    name: '久しぶり2',
    description: '',
    rank: 0,
    weight: 1,
    threshold: [],
    status: '',
    placeIds: ['1730456953853-2kr1z'],
    post: [
     {
      type: 'onecomme',
      botKey: 'marisa',
      iconKey: 'joy01',
      delaySeconds: 0,
      content: '<<WelcomeAgain02>>'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!シーン切り替え1'
     }
    ]
   },
   '1731148126492-sqbn5': {
    id: '1731148126492-sqbn5',
    name: '初見1',
    description: '',
    rank: 0,
    weight: 3,
    threshold: [],
    status: '',
    placeIds: ['1731148195677-a91wm'],
    post: [
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!初見'
     },
     {
      type: 'onecomme',
      botKey: 'reimu',
      iconKey: 'joy01',
      delaySeconds: 1.5,
      content: '<<WelcomeSyoken01>>'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 1.5,
      content: '!レベルアップ'
     }
    ]
   },
   '1731149012459-vcc4r': {
    id: '1731149012459-vcc4r',
    name: '初見2',
    description: '',
    rank: 0,
    weight: 1,
    threshold: [],
    status: '',
    placeIds: ['1731148223609-ya4xm'],
    post: [
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!初見'
     },
     {
      type: 'onecomme',
      botKey: 'marisa',
      iconKey: 'joy01',
      delaySeconds: 1.5,
      content: '<<WelcomeSyoken02>>'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 1.5,
      content: '!レベルアップ'
     }
    ]
   },
   '1731149419725-o1ebm': {
    id: '1731149419725-o1ebm',
    name: 'こんにちは1',
    description: '',
    rank: 0,
    weight: 1,
    threshold: [],
    status: '',
    placeIds: ['1731149450144-4z43k'],
    post: [
     {
      type: 'onecomme',
      botKey: 'reimu',
      iconKey: 'fun01',
      delaySeconds: 0,
      content: '<<WelcomeHi01>>'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!シーン切り替え1'
     }
    ]
   },
   '1731149560925-musjw': {
    id: '1731149560925-musjw',
    name: 'こんにちは2',
    description: '',
    rank: 0,
    weight: 1,
    threshold: [],
    status: '',
    placeIds: ['1731149461424-arcth'],
    post: [
     {
      type: 'onecomme',
      botKey: 'marisa',
      iconKey: 'joy03',
      delaySeconds: 0,
      content: '<<WelcomeHi02>>'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!シーン切り替え1'
     }
    ]
   },
   '1731155030049-srmcn': {
    id: '1731155030049-srmcn',
    name: 'ギフト:default02',
    description: '',
    rank: 0,
    weight: 1,
    threshold: [],
    status: '',
    placeIds: [],
    post: [
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!金額表示'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0.3,
      content: '!kinoko'
     },
     {
      type: 'onecomme',
      botKey: 'marisa',
      iconKey: 'joy03',
      delaySeconds: 0.5,
      content: 'やったぜ!<<user>>さんからギフトを頂いたぜ。これを元手に配信に精を出すぜ。ありがとだぜ!'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0.5,
      content: '!シーン切り替え1'
     }
    ]
   },
   '1731155125168-cfu88': {
    id: '1731155125168-cfu88',
    name: 'ギフト:default01',
    description: '',
    rank: 0,
    weight: 3,
    threshold: [],
    status: '',
    placeIds: [],
    post: [
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!金額表示'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0.3,
      content: '!saisen_hako'
     },
     {
      type: 'onecomme',
      botKey: 'reimu',
      iconKey: 'joy03',
      delaySeconds: 0.5,
      content: '<<user>>さん、ギフトありがとう!これからも配信続けていくわ。応援してね!'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0.5,
      content: '!シーン切り替え1'
     }
    ]
   },
   '1731155187246-xn0mv': {
    id: '1731155187246-xn0mv',
    name: 'ギフト:over1000',
    description: '',
    rank: 0,
    weight: 1,
    threshold: [],
    status: '',
    placeIds: [],
    post: [
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!金額表示'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0.3,
      content: '!saisen_hako'
     },
     {
      type: 'onecomme',
      botKey: 'reimu',
      iconKey: 'love02',
      delaySeconds: 0.5,
      content: '<<price>>ポイント!! <<user>>さん、こんなに貰っちゃっていいの!?もう私達頑張るしかないじゃない!'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0.5,
      content: '!シーン切り替え1'
     }
    ]
   },
   '1731155301283-ro22u': {
    id: '1731155301283-ro22u',
    name: 'ギフト:over2000',
    description: '',
    rank: 0,
    weight: 1,
    threshold: [],
    status: '',
    placeIds: [],
    post: [
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!金額表示'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0.3,
      content: '!kinoko'
     },
     {
      type: 'onecomme',
      botKey: 'marisa',
      iconKey: 'love02',
      delaySeconds: 0.5,
      content: '<<price>>ポイント!!いいのか?<<user>>さん!あなたの心意気に感謝するぜ!'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0.5,
      content: '!シーン切り替え1'
     }
    ]
   },
   '1731155764248-k28me': {
    id: '1731155764248-k28me',
    name: '初見詐欺011',
    description: '',
    rank: 0,
    weight: 4,
    threshold: [],
    status: '',
    placeIds: ['1731155882263-4ja9n'],
    post: [
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!初見'
     },
     {
      type: 'onecomme',
      botKey: 'reimu',
      iconKey: 'contempt02',
      delaySeconds: 1.5,
      content: '<<WelcomeSagi011>>'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 1.5,
      content: '!間抜け5'
     }
    ]
   },
   '1731156395590-mupgd': {
    id: '1731156395590-mupgd',
    name: '初見詐欺012',
    description: '',
    rank: 0,
    weight: 3,
    threshold: [],
    status: '',
    placeIds: ['1731156055398-gp9rl'],
    post: [
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!初見'
     },
     {
      type: 'onecomme',
      botKey: 'reimu',
      iconKey: 'panic02',
      delaySeconds: 1.5,
      content: '<<WelcomeSagi012>>'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 1.5,
      content: '!チーン1'
     }
    ]
   },
   '1731156509378-04ync': {
    id: '1731156509378-04ync',
    name: '初見詐欺02',
    description: '',
    rank: 0,
    weight: 3,
    threshold: [
     {
      conditionType: 'count',
      count: {
       comparison: 'max',
       unit: 'tc',
       value1: 100,
       value2: 1
      }
     }
    ],
    status: '',
    placeIds: ['1731156154823-jl5w6'],
    post: [
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 0,
      content: '!初見'
     },
     {
      type: 'onecomme',
      botKey: 'marisa',
      iconKey: 'sorry02',
      delaySeconds: 1.5,
      content: '<<WelcomeSagi02>>'
     },
     {
      type: 'party',
      botKey: 'reimu',
      iconKey: 'Default',
      delaySeconds: 1.5,
      content: '!ビシッとツッコミ1'
     }
    ]
   }
  },
  places: {
   '1730456801704-8lpzk': {
    id: '1730456801704-8lpzk',
    name: 'WelcomeAgain01',
    description: '',
    values: [
     {
      weight: 9,
      value: '、久しぶり!また会えたね。'
     },
     {
      weight: 7,
      value: '、お久しぶりね!また会えたことを嬉しく思うわ。'
     },
     {
      weight: 5,
      value: 'が久々に来たよ。挨拶しなきゃ!'
     }
    ]
   },
   '1730456953853-2kr1z': {
    id: '1730456953853-2kr1z',
    name: 'WelcomeAgain02',
    description: '',
    values: [
     {
      weight: 7,
      value: 'おっ、<<user>>さんだぜ。久しぶり!ゆっくりしていってね!'
     },
     {
      weight: 5,
      value: '<<user>>さん! また来てくれたんだぜ、会いたかったと配信者は嬉し涙だぜ。'
     }
    ]
   },
   '1731148195677-a91wm': {
    id: '1731148195677-a91wm',
    name: 'WelcomeSyoken01',
    description: '',
    values: [
     {
      weight: 1,
      value: '<<user>>さん、初めまして!ゆっくりしていってね。'
     },
     {
      weight: 1,
      value: '初見の<<user>>さん、コメントありがとう!とっても嬉しいわ!'
     },
     {
      weight: 1,
      value: '<<user>>さん、来てくれてありがとう!何か聞きたいことがあれば、気軽にどうぞ!'
     }
    ]
   },
   '1731148223609-ya4xm': {
    id: '1731148223609-ya4xm',
    name: 'WelcomeSyoken02',
    description: '',
    values: [
     {
      weight: 1,
      value: 'おっ、<<user>>さんが初めてのコメントだぜ!ようこそだぜ。'
     },
     {
      weight: 1,
      value: '<<user>>さん、ようこそ!コメント助かるぜ～!'
     }
    ]
   },
   '1731149450144-4z43k': {
    id: '1731149450144-4z43k',
    name: 'WelcomeHi01',
    description: '',
    values: [
     {
      weight: 1,
      value: '<<user>>さん、こんにちは!ゆっくりしていってね。'
     },
     {
      weight: 1,
      value: '<<user>>さん、また来てくれたね。ようこそ。'
     }
    ]
   },
   '1731149461424-arcth': {
    id: '1731149461424-arcth',
    name: 'WelcomeHi02',
    description: '',
    values: [
     {
      weight: 1,
      value: 'おっ、<<user>>さんだ。これで<<tc>>回目のコメントだぜ'
     },
     {
      weight: 1,
      value: '今日もコメントありがとうだぜ、<<user>>さん。'
     }
    ]
   },
   '1731155882263-4ja9n': {
    id: '1731155882263-4ja9n',
    name: 'WelcomeSagi011',
    description: '',
    values: [
     {
      weight: 1,
      value: '<<user>>さん…あなた初見じゃないでしょ。'
     },
     {
      weight: 1,
      value: '<<user>>さん、初めまして…なんて言ってるけど、絶対どこかで会ってるわ。'
     },
     {
      weight: 1,
      value: '<<user>>さん、どこかで見たような…なんていうか、運命を感じるわ。'
     }
    ]
   },
   '1731156055398-gp9rl': {
    id: '1731156055398-gp9rl',
    name: 'WelcomeSagi012',
    description: '',
    values: [
     {
      weight: 1,
      value: '<<user>>さん、初めまし…あなた初見ではないわね?'
     },
     {
      weight: 1,
      value: '<<user>>さん、どこか見覚えがあるわ。以前にもお話したような気が…'
     }
    ]
   },
   '1731156154823-jl5w6': {
    id: '1731156154823-jl5w6',
    name: 'WelcomeSagi02',
    description: '',
    values: [
     {
      weight: 3,
      value: 'おい!<<user>>さん初見ちゃうやろ!<<tc>>回もコメントくれてるぜ!?'
     },
     {
      weight: 2,
      value: '<<user>>さん、まさか私を騙そうとしてるのか？私はあなたのことをよく知っているぜ。'
     },
     {
      weight: 1,
      value: '知ってたか？100回以上もコメントがあると私が出るんだぜ。<<user>>さんは<<tc>>回もコメントしてるぜ。'
     }
    ]
   }
  }
 }
};
