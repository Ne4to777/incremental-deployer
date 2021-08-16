# incremental-deployer
Утилита для инкрементного аплоада локального билда на сервер

## Как работает
1. Запускает билд пакета, который ты указал в конфиге
2. Смотрит, какие файлы изменились после предыдущего билда
3. Загружает их на сервер
4. Profit!!!

Для полной эффективности, на сервере должен быть запущен watcher. 
Тогда после запуска команды, тебе остается лишь подождать и обновить страничку.

## Установка
```
git clone https://github.yandex-team.ru/nybble/incremental-deployer.git
cd incremental-deployer
npm i
```

## Настройка
Создать файл конфига в папке запуска скрипта (по-умолчанию `deployer.config.json`)
Прописать параметры:
- <b>deployerCacheName</b>? - имя файла кэша (по-умолчанию `.deployerCache.json`)
- <b>ssh</b> - ssh-соединениe
    - <b>login</b> - логин для ssh-подключения к серверу
    - <b>host</b> - хост для ssh-подключения к серверу
    - <b>port</b>? - порт для ssh-подключения к серверу (по-умолчанию `22`)
    - <b>privateKey</b>? - путь к ssh-ключу (например: `/home/user/.ssh/id_rsa`)
    - <b>remotePath</b> - папка на сервере, куда скопируется билд (по-умолчанию `~`)
- <b>outDir</b>? - кэшируемая папка, из которой будет идти загрузка на сервер (по-умолчанию `dist`)
- <b>command</b>? - команда запуска билда на твое усмотрение
- <b>stages</b>? - дополнительная папка для деплоя. Если надо что-то копировать после билда и не хочется тащить каждый раз весь билд, а только то, что изменилось (необязатльная)
    - <b>command</b> - команда запуска билда на твое усмотрение
    - <b>outDir</b>? - папка, в которую должен отработать `command` (по-умолчанию `dist`)
    - <b>diffDir</b>? - папка, в которую запишутся только измененные файлы

Если не указан `command` будет взят `stages`.

## Запуск
- `npx incremental-deployer --init` - проинициализировать кэш (запустить первый раз)
- `npx incremental-deployer` - ребилд и деплой (юзаем после каждого сохранения)
- `npx incremental-deployer --clear` - удалить все, что насоздавал деплоер (когда что-то пошло не так)
- `npx incremental-deployer --config my.config.json <другие флаги>` - если хотите кастомный файл конфига
- `npx incremental-deployer --help` - вывести список команд

## Примеры
1. На примере Маркета и `mandrel`, нам сначала надо сбилдить через `tsc`, потом затранспайлить через `babel` и докинуть стилей от `stylus`.
Можно это сделать одной командой в `cache`:
```
{
  ...,
  "command": "tsc --build tsconfig.deployer.json && babel build -d dist --verbose --copy-files --ignore build/components && copyfiles -u 1 src/**/*.styl dist"
},
```
и оно будет работать, но бабель каждый раз станет копировать весь билд.
Можно сделать лучше: 
```
{
  ...,
  "stages": [
    [
      {
        "outDir": "build",
        "command": "tsc --build tsconfig.deployer.json",
        "diffDir": "buildDiff"
      }, {
        "command": "babel buildDiff -d dist --verbose --copy-files --ignore buildDiff/components"
      }
    ], 
    [
      {
        "command": "copyfiles -u 1 src/**/*.styl dist"
      }
    ]
  ]
 }
```
Первый массив из двух конфигов отработает последовательно, то есть сначала `tsc` сбилдится в `build` и `buildDiff`, 
а потом `babel` скопирует все из `buildDiff` в `dist`.
Конфиг второго массива скопирует стили параллельно, так как не зависит от других билдов.

2. Нам примере Маркета и `apiary`. Тут дебажный билд это просто транспайл `babel --verbose src -d dist --ignore **/__spec__/* --extensions ".ts,.tsx"`, 
 который можно засунуть в `command`, но оно будет всегда транспайлить весь `src`. Можно сделать иначе:
```
{
    ...,
    "stages": [
        [
           {
                "command": "rsync -r src/. build",
                "outDir": "build",
                "diffDir": "buildDiff"
            },
            {
                "command": "babel --verbose buildDiff -d dist --ignore **/__spec__/* --extensions \".ts,.tsx\"",
            }
        ],
      ]
}
```
Теперь, хоть и копироваться будет всё, но это очень быстрая операция и нет смысла не ней заморачиваться, а вот транспайлиться будет только разница.

Примеры конфигов лежат в `example`.

## Тикет с предложениями
[MARKETFRONTECH-3018](https://st.yandex-team.ru/MARKETFRONTECH-3018)
