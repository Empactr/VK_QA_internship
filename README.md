# Github Issues

## Environment
```
Device: Mac M1
    OS: macOs Ventura 13.0
NodeJS: v18.16.1
```
## Build
Чтобы установить необходимый пакет библиотек используйте команду: `make build`

В качестве сторонних библиотек были использованы:
```
> Playwright
> otpauth
> allure-playwright
> allure-commandline
> dotenv
```

## Test
Чтобы прогнать тесты используйте команду: `make test`

Если будут возникать ошибки, то нужно сгенерировать новый токен и поместить его в файл `/env`

<img width="684" alt="Снимок экрана 2024-07-10 в 3 55 31 AM" src="https://github.com/Empactr/VK_QA_internship/assets/174928463/a6b39bc0-7b6c-4bde-95f4-4a601273f7a8">

## Allure Report
Чтобы получить отчет о ходе тестирования используйте команду: `make show-report`


<img width="1323" alt="Снимок экрана 2024-07-07 в 3 45 08 PM" src="https://github.com/Empactr/VK_QA_internship/assets/174928463/441f7449-11a2-4a11-b725-0f459597eaa6">

## Концепция

Для реализации я использовал внутри одного метода `test()` реализацию отдельных шагов `test.step()`, так как неудачное завершение **Тест-кейса "Обновление Issue с валидными данными"** не влияет на успешность оставшихся тестов, в свою очередь неудачное завершения **Тест-кейс "Создание Issue с валидными данными"** не дает возможность **Обновить** или **Удалить**, в таком случае выбрасывается **Error** и работа скрипта прекращается.
