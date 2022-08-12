// available langs

export type LanguageItem = {
  cr_locale?: string,
  locale: string,
  code: string,
  name: string,
  language?: string,
  funi_locale?: string,
  funi_name?: string,
  funi_name_lagacy?: string
}

const languages: LanguageItem[] = [
  { cr_locale: 'en-US',  funi_locale: 'enUS', locale: 'en',     code: 'eng', name: 'English'                   },
  { cr_locale: 'es-LA',  funi_name: 'Spanish (LAS)', funi_name_lagacy: 'Spanish (Latin Am)', funi_locale: 'esLA', locale: 'es-419', code: 'spa-419', name: 'Spanish',    language: 'Latin American Spanish' },
  { cr_locale: 'es-419', locale: 'es-419', code: 'spa-419', name: 'Spanish',    language: 'Latin American Spanish' },
  { cr_locale: 'es-ES',  locale: 'es-ES',  code: 'spa-ES', name: 'Castilian',  language: 'European Spanish'        },
  { cr_locale: 'pt-BR',  funi_name: 'Portuguese (Brazil)', funi_locale: 'ptBR', locale: 'pt',  code: 'por', name: 'Portuguese', language: 'Brazilian Portuguese'   },
  { cr_locale: 'pt-BR',  funi_name: 'Portuguese (Brazil)', funi_locale: 'ptBR', locale: 'pt-BR',  code: 'por', name: 'Portuguese', language: 'Brazilian Portuguese'   },
  { cr_locale: 'fr-FR',  locale: 'fr',     code: 'fra', name: 'French'                                         },
  { cr_locale: 'de-DE',  locale: 'de',     code: 'deu', name: 'German'                                         },
  { cr_locale: 'ar-ME',  locale: 'ar',     code: 'ara', name: 'Arabic'                                         },
  { cr_locale: 'ar-SA',  locale: 'ar',     code: 'ara', name: 'Arabic'                                         },
  { cr_locale: 'it-IT',  locale: 'it',     code: 'ita', name: 'Italian'                                        },
  { cr_locale: 'ru-RU',  locale: 'ru',     code: 'rus', name: 'Russian'                                        },
  { cr_locale: 'tr-TR',  locale: 'tr',     code: 'tur', name: 'Turkish'                                        },
  { cr_locale: 'hi-IN',  locale: 'hi',     code: 'hin', name: 'Hindi'                                          },
  { funi_locale: 'zhMN', locale: 'zh',     code: 'cmn', name: 'Chinese (Mandarin, PRC)'                        },
  { cr_locale: 'zh-CN', locale: 'zh',     code: 'zho', name: 'Chinese (Mainland China)'                        },
  { cr_locale: 'ko-KR', locale: 'ko', code: 'kor', name: 'Korean'                                              },
  { cr_locale: 'ja-JP',  funi_locale: 'jaJP', locale: 'ja',     code: 'jpn', name: 'Japanese'                  },
];

// add en language names
(() =>{
  for(const languageIndex in languages){
    if(!languages[languageIndex].language){
      languages[languageIndex].language = languages[languageIndex].name;
    }
  }
})();

// construct dub language codes
const dubLanguageCodes = (() => {
  const dubLanguageCodesArray = [];
  for(const language of languages){
    dubLanguageCodesArray.push(language.code);
  }
  return [...new Set(dubLanguageCodesArray)];
})();

// construct subtitle languages filter
const subtitleLanguagesFilter = (() => {
  const subtitleLanguagesExtraParameters = ['all', 'none'];
  return [...subtitleLanguagesExtraParameters, ...new Set(languages.map(l => { return l.locale; }))];
})();

const searchLocales = (() => {
  return ['', ...new Set(languages.map(l => { return l.cr_locale; }).slice(0, -1))];
})();

// convert
const fixLanguageTag = (tag: string) => {
  tag = typeof tag == 'string' ? tag : 'und'; 
  const tagLangLC = tag.match(/^(\w{2})-?(\w{2})$/);
  if(tagLangLC){
    const tagLang = `${tagLangLC[1]}-${tagLangLC[2].toUpperCase()}`;
    if(findLang(tagLang).cr_locale != 'und'){
      return findLang(tagLang).cr_locale;
    }
    else{
      return tagLang;
    }
  }
  else{
    return tag;
  }
};

// find lang by cr_locale
const findLang = (cr_locale: string) => {
  const lang = languages.find(l => { return l.cr_locale == cr_locale; });
  return lang ? lang : { cr_locale: 'und', locale: 'un', code: 'und', name: '', language: '' };
};

const fixAndFindCrLC = (cr_locale: string) => {
  const str = fixLanguageTag(cr_locale);
  return findLang(str || '');
};

// rss subs lang parser
const parseRssSubtitlesString = (subs: string) => {
  const splitMap = subs.replace(/\s/g, '').split(',').map((s) => {
    return fixAndFindCrLC(s).locale;
  });
  const sort = sortTags(splitMap);
  return sort.join(', ');
};


// parse subtitles Array
const parseSubtitlesArray = (tags: string[]) => {
  const sort = sortSubtitles(tags.map((t) => {
    return { locale: fixAndFindCrLC(t).locale };
  }));
  return sort.map((t) => { return t.locale; }).join(', ');
};

// sort subtitles
const sortSubtitles = <T extends {
  [key: string]: unknown
} = Record<string, string>> (data: T[], sortkey?: keyof T) : T[] => {
  const idx: Record<string, number> = {};
  const key = sortkey || 'locale' as keyof T;
  const tags = [...new Set(Object.values(languages).map(e => e.locale))];
  for(const l of tags){
    idx[l] = Object.keys(idx).length + 1;
  }
  data.sort((a, b) => {
    const ia = idx[a[key] as string] ? idx[a[key] as string] : 50;
    const ib = idx[b[key] as string] ? idx[b[key] as string] : 50;
    return ia - ib;
  });
  return data;
};

const sortTags = (data: string[]) => {
  const retData = data.map(e => { return { locale: e }; });
  const sort = sortSubtitles(retData);
  return sort.map(e => e.locale as string);
};

const subsFile = (fnOutput:string, subsIndex: string, langItem: LanguageItem, isCC: boolean, ccTag: string) => {
  subsIndex = (parseInt(subsIndex) + 1).toString().padStart(2, '0');
  return `${fnOutput}.${subsIndex}.${langItem.code}.${langItem.language}${isCC ? `.${ccTag}` : ''}.ass`;
};

// construct dub langs const
const dubLanguages = (() => {
  const dubDb: Record<string, string> = {};
  for(const lang of languages){
    if(!Object.keys(dubDb).includes(lang.name)){
      dubDb[lang.name] = lang.code;
    }
  }
  return dubDb;
})();

// dub regex
const dubRegExpStr =
    `\\((${Object.keys(dubLanguages).join('|')})(?: (Dub|VO))?\\)$`;
const dubRegExp = new RegExp(dubRegExpStr);

// code to lang name
const langCode2name = (code: string) => {
  const codeIdx = dubLanguageCodes.indexOf(code);
  return Object.keys(dubLanguages)[codeIdx];
};

// locale to lang name
const locale2language = (locale: string) => {
  const filteredLocale = languages.filter(l => {
    return l.locale == locale;
  });
  return filteredLocale[0];
};

// output
export {
  languages,
  dubLanguageCodes,
  dubLanguages,
  langCode2name,
  locale2language,
  dubRegExp,
  subtitleLanguagesFilter,
  searchLocales,
  fixLanguageTag,
  findLang,
  fixAndFindCrLC,
  parseRssSubtitlesString,
  parseSubtitlesArray,
  sortSubtitles,
  sortTags,
  subsFile,
};
