/*
Generated with http://www.json-generator.com/
[
  '{{repeat(30, 50)}}',
  {
    streamId: '{{index([1])}}',
    streamKey: '{{guid()}}',
    roomId: '{{guid()}}',
    title: '{{lorem(5, "words")}}',
    startDateTime: '{{integer(127387283782, 127387883782)}}',
    totalViewers: '{{integer(0, 2000)}}',
    totalStickers: '{{integer(0, 20000)}}',
    live: '{{random(0, 1)}}',
    description: '{{lorem()}}',
    user: {
      userId: '{{integer(1, 50000)}}',
      username: '{{firstName()}}.{{firstName()}}',
      platform_type: '{{random("facebook", "twitter")}}',
      alias: '{{firstName()}}',
      email: '{{email()}}',
      createdAt: '{{date(new Date(2015,0,1), new Date(), "ISODateTime")}}',
      updatedAt: '{{date(new Date(2015,0,1), new Date(), "ISODateTime")}}'
    },
    createdAt: '{{date(new Date(2015,0,1), new Date(), "ISODateTime")}}',
    updatedAt: '{{date(new Date(2015,0,1), new Date(), "ISODateTime")}}'
  }
]
 */