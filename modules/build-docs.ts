import packageJSON from '../package.json';
import fs from 'fs';
import path from 'path';
import { args, groups } from './module.args';

const transformService = (str: 'funi'|'crunchy'|'both') => {
  switch (str) {
  case 'both':
    return 'Both';
  case 'crunchy':
    return 'Crunchyroll';
  case 'funi':
    return 'Funimation';
  }
};

let docs = `# ${packageJSON.name} (${packageJSON.version}v)

If you find any bugs in this documentation or in the programm itself please report it [over on GitHub](${packageJSON.bugs.url}).

## Legal Warning

This application is not endorsed by or affiliated with *Funimation* or *Crunchyroll*.
This application enables you to download videos for offline viewing which may be forbidden by law in your country.
The usage of this application may also cause a violation of the *Terms of Service* between you and the stream provider.
This tool is not responsible for your actions; please make an informed decision before using this application.

## CLI Options
### Legend
 - \`\${someText}\` shows that you should replace this text with your own
    - e.g. \`--username \${someText}\` -> \`--username Izuco\`
`;

Object.entries(groups).forEach(([key, value]) => {
  docs += `\n### ${value.slice(0, -1)}\n`;
  
  docs += args.filter(a => a.group === key).map(argument => {
    return [`#### \`${argument.name.length > 1 ? '--' : '-'}${argument.name}\``,
      `| **Service** | **Usage** | **Type** | **Required** | **Alias** | ${argument.choices ? '**Choices** |' : ''} ${argument.default ? '**Default** |' : ''}**cli-default Entry**`,
      `| --- | --- | --- | --- | --- | ${argument.choices ? '--- | ' : ''}${argument.default ? '--- | ' : ''}---| `,
      `| ${transformService(argument.service)} | \`${argument.name.length > 1 ? '--' : '-'}${argument.name} ${argument.usage}\` | \`${argument.type}\` | \`${argument.demandOption ? 'Yes' : 'No'}\`|`
    + ` \`${(argument.alias ? `${argument.alias.length > 1 ? '--' : '-'}${argument.alias}` : undefined) ?? 'NaN'}\` |`
    + `${argument.choices ? ` [${argument.choices.map(a => `\`${a || '\'\''}\``).join(', ')}] |` : ''}`
    + `${argument.default ? ` \`${
      typeof argument.default === 'object'
        ? Array.isArray(argument.default) 
          ? JSON.stringify(argument.default)
          : argument.default.default
        : argument.default
    }\`|` : ''}`
    + ` ${typeof argument.default === 'object' && !Array.isArray(argument.default)
      ? `\`${argument.default.name || argument.name}: \``
      : '`NaN`'
    } |`,
      '',
      argument.docDescribe === true ? argument.describe : argument.docDescribe
    ].join('\n');
  }).join('\n');
});



fs.writeFileSync(path.resolve(__dirname, '..', 'docs', 'DOCUMENTATION.md'), docs);