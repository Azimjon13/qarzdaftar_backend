import { Knex } from 'knex';
import { keyValuesRussian } from '../mock/keys-ru';
import { keyValuesEnglish } from '../mock/keys-eng';
import { keyValuesUzbek } from '../mock/keys-uz';

export async function seed(knex: Knex): Promise<void> {
  await Promise.all([
    knex('translation_keys').del(),
    knex('translation_values').del(),
  ]);
  const keysArray: any[] = [];
  Object.keys(keyValuesEnglish).map((key) =>
    keysArray.push({ name: key, title: keyValuesEnglish[key] }),
  );
  let insertedKeys: any = [];
  for (let i = 0; i < keysArray.length; i++) {
    insertedKeys.push(keysArray[i]);
    if (insertedKeys.length >= 99 || i + 1 === keysArray.length) {
      const res: { id: number; name: string }[] = await knex('translation_keys')
        .insert(insertedKeys)
        .returning('*');
      insertedKeys = [];
      const translationValuesEng: any[] = [];
      res.map((item) => {
        if (keyValuesEnglish[item.name]) {
          translationValuesEng.push({
            translation_id: 1,
            translation_key_id: item.id,
            name: keyValuesEnglish[item.name],
          });
        }
      });
      const translationValuesRu: any[] = [];
      res.map((item) => {
        if (keyValuesRussian[item.name]) {
          translationValuesRu.push({
            translation_id: 2,
            translation_key_id: item.id,
            name: keyValuesRussian[item.name],
          });
        }
      });
      const translationValuesUz: any[] = [];
      res.map((item) => {
        if (keyValuesUzbek[item.name]) {
          translationValuesUz.push({
            translation_id: 3,
            translation_key_id: item.id,
            name: keyValuesUzbek[item.name],
          });
        }
      });
      if (translationValuesEng.length !== 0) {
        await knex('translation_values').insert(translationValuesEng);
      }
      if (translationValuesRu.length !== 0) {
        await knex('translation_values').insert(translationValuesRu);
      }
      if (translationValuesUz.length !== 0) {
        await knex('translation_values').insert(translationValuesUz);
      }
    }
  }
}
