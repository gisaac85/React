import { action, runInAction, observable, computed } from 'mobx';
//import todoList from '../components/todos.json';
//import moment from 'moment';
import '../App.css';

const API_ROOT = "https://hyf-react-api.herokuapp.com";
const initialValue = {
    description: '',
    deadline: ''

};

class TodoStore {

    @observable
    listTodo = []

    @observable
    descText = '';

    @observable
    emptyListTodo = {}

    @observable
    defaultValue = initialValue

    @observable
    editing = true

    @observable
    selectedToEdit = null

    @observable
    editedTask = ''

    @computed
    get completedTodosCount() {
        return this.listTodo.filter(
            todo => todo.done === true
        ).length;
    }
    @computed
    get todosCount() {
        return this.listTodo.length;
    }

    @action
    onChanging = (index, value) => {
        const newValue = this.defaultValue;
        newValue[index] = value;
        this.defaultValue = newValue;

    };


    @action
    handleEditing = () => {

        this.editing = false;

    }

    @action
    handleEditingDone = (e) => {
        // keyCode=13 is firing when you click ENTER
        if (e.keyCode === 13) {

            this.editing = false;
            this.defaultValue.description = this.descText;

        }

    }

    @action
    handleEditingChange = (e) => {

        this.descText = e.target.value;

    }

    //Week5 Actions

    @action
    getTodos = async () => {
        try {
            const res = await fetch(`${API_ROOT}/todos`);
            const parsedResponse = await res.json();
            runInAction(() => {
                this.listTodo = parsedResponse;
            })

        }
        catch (error) {
            console.log(error);
        }
    }

    @action
    addFunction = async (description, deadline) => {

        if (this.defaultValue.description === '' || this.defaultValue.deadline === '') {
            alert('You Should Enter a Todo!');
            return;
        }

        await fetch(`${API_ROOT}/todos/create`, {
            method: "POST",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(this.defaultValue),

        })

        this.getTodos();
        this.clearText();
    }

    @action
    clearText = () => {
        this.defaultValue = {
            description: '',
            deadline: ''
        }

    }

    @action
    toggleCheckbox = async (_id) => {
        const todoElement = this.listTodo.find(todoElement => todoElement._id === _id);
        await fetch(`${API_ROOT}/todos/${_id}`, {
            method: "PATCH",
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                done: !todoElement.done,
            })
        })
        this.getTodos();
    }

    @action
    removeTodo = (id) => {

        fetch(`${API_ROOT}/todos/${id}`, {
            method: "DELETE",
            headers: { 'content-type': 'application/json' }
        }).then((res) => {
            this.getTodos();
        });

        this.listTodo = this.listTodo.filter(todo => todo._id !== id)

    }

    // Edit Functions

    @action
    startEditing = (id) => {
        this.selectedToEdit = id
        this.editing = false;
    }

    @action
    updateTask = (id, update) => {

        fetch(`${API_ROOT}/todos/${id}`, {
            method: 'PATCH',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify({ "description": update })
        }).then((result) => {
            return result.json()
        }).then((res) => {
            this.getTodos();
        });

        this.editing = true;
        this.editedTask = ''



    }

    @action
    changeEditedTask = event => {
        this.editedTask = event.target.value;

    }

    @action
    cancelEditing = () => {
        this.editing = true
    }

}
export default new TodoStore();
