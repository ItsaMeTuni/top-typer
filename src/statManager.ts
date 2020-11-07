export class WordStat
{
    word: string = '';
    duration: number = 0;

    // Letter indexes inside `word` that
    // were typos
    typos: number[] = [];

    static fromText(text: string): WordStat[]
    {
        const wordStats = [new WordStat()];

        for(let i = 0; i < text.length; i++)
        {
            if(text[i] === ' ')
            {
                wordStats.push(new WordStat());
            }

            wordStats[wordStats.length - 1].word += text[i];
        }

        return wordStats;
    }
}

export class Stat
{
    accuracy: number = 0;
    words: WordStat[] = [];

    timestamp: number = 0;
}

export function calcWpm(wordStats: WordStat[], currentWordIndex: number = -1): number
{
    if(currentWordIndex === -1)
    {
        currentWordIndex = wordStats.length;
    }

    const wordDurations = wordStats.map(x => x.duration);
    const typedWordDurations = wordDurations.slice(0, currentWordIndex + 1);
    const avgSecsPerWord = typedWordDurations.slice(0, currentWordIndex + 1).reduce((acc, x) => acc + x, 0) / 1000 / typedWordDurations.length;   
    return Math.floor(60 / avgSecsPerWord);
}

export function calcAccuracy(wordStats: WordStat[], currentWordIndex: number = -1): number
{
    if(currentWordIndex === -1)
    {
        currentWordIndex = wordStats.length;
    }

    const words = wordStats.filter((_, i) => i <= currentWordIndex || currentWordIndex === -1);

    const charCount = words.reduce((acc, x) => acc + x.word, '').length;
    const typoCount = words.reduce((acc, x) => acc + x.typos.length, 0);

    return 1 - typoCount / charCount;
}

export function getStats(): Stat[]
{
    const statHistoryStr = localStorage.getItem('statHistory');
    if(statHistoryStr === null)
    {
        return [];
    }

    const values = JSON.parse(statHistoryStr) as any[];

    const statHistory: Stat[] = [];

    for(const value of values)
    {
        const stat = new Stat();

        stat.wpm        = value.wpm         || null;
        stat.accuracy   = value.accuracy    || null;
        stat.timestamp  = value.timestamp   || null;

        for(const word of value.words)
        {
            const wordStat = new WordStat();

            wordStat.duration   = word.duration     || null;
            wordStat.typos      = word.typos        || null;
            wordStat.word       = word.word         || null;

            stat.words.push(wordStat);
        }

        statHistory.push(stat);
    }

    return statHistory;
}

export function saveStat(stat: Stat)
{
    const stats = getStats();
    stats.push(stat);
    saveHistory(stats);
}

export function saveHistory(stats: Stat[])
{
    localStorage.setItem('statHistory', JSON.stringify(stats));
}