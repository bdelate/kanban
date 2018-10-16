# kanban
Kanban board created using Django Rest Framework on the back end with React and Redux on the front end.

More information on the creation of 'kanban' is available here: [Kanban - Info](https://www.grokmycode.com/portfolio/kanban)

A live demo of 'kanban' is available here: [Kanban - Live demo](https://kanban.grokmycode.com)

Functionality:

* Multiple boards per user
* Column and card (task) creation
* Dragging of cards between columns
* Dragging of cards within a column to sort / organise them

### Dev setup
```
docker-compose build
docker-compose run web python ./kanban/manage.py migrate --settings=kanban.settings.dev
docker-compose run web python ./kanban/manage.py createsuperuser --settings=kanban.settings.dev
docker-compose up
```
