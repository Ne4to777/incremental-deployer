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
- <b>stagedDirName</b> - папка, которая используется для сравнения файлов (по-умолчанию `dist`)
- <b>command</b> - команда запуска билда на твое усмотрение, например, для маркета `tsc --build tsconfig.deploy.json && babel build -d staged --verbose --copy-files --ignore build/components && copyfiles -u 1 src/**/*.styl staged`
- <b>deployerCacheName</b> - имя файла кэша (по-умолчанию `.deployerCache.json`)
- <b>login</b> - логин для ssh-подключения к серверу
- <b>host</b> - хост для ssh-подключения к серверу
- <b>port</b> - порт для ssh-подключения к серверу (по-умолчанию `22`)
- <b>remotePath</b> - папка на сервере, куда скопируется билд (по-умолчанию `~`)

## Запуск
- `npx run incremental-deployer` - если файл конфига не задан
- `npx run incremental-deployer --config my.config.json` - если файл конфига задан

## Тикет с предложениями
[MARKETFRONTECH-3018](https://st.yandex-team.ru/MARKETFRONTECH-3018)
