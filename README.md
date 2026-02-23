# auth-ms
ejecutamos nest new auth-ms
movemos todos los archivos a la carpeta global auth-ms

eliminamos service y controller de cuando se crea el proyecto
Creamo un nuevo recurso nest g res auth --no-spec
transport Microservice(no http)
No crear CRUD

creamos unos servicio en el controller
hacemos la instalacion de lo siguientes paquetes microservices nats dotenv y joi
yarn add @nestjs/microservices nats dotenv joi 

copiamos la carpeta de config de orders-ms a auth-ms

en main creamos la configuracion de nuestro microservicios

copiamos docker ignore y dockerfile para poner este microservice en la misma red que los demas

instalamos class-validator y clkass- transformer

yarn add class-validator class-transformer
creamos los dtos
agregamos el pipe validator y modificamos los controladores

Aprovisionar base de datos mongo db usando mongo db atlas
Instalamos prisma
prisma es una dependencia de desarrollo
yarn add prisma -D
luego npx prisma init
esto en nuestro microservices coloca la variable en .env DATABASE_URL para copnectar a una base de datos postgres
reemplamos el valor por el de mongodb
creamos el model en prisma schema

Generamos el cliente
npx prisma generate

encriptar contrase;a
instlamos bcrypt
yarn add bcrypt
importamos la libreria en el service, seguramente pida instlaar types/bcrypt

hasheamos la password al crear un usuario nuevo
