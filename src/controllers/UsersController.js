const AppError = require("../utils/AppError");
const { hash, compare } = require("bcryptjs");
const knex = require("../database/knex/index");

class UsersController {

    async create(request, response) {
        const { name, email, password } = request.body;

        if (!name || !email || !password) {
            throw new AppError("Nome, email e senha são obrigatórios!")
        }

        const checkIfUserExist = await knex('users').where('email', email)

        if (checkIfUserExist.length !== 0) {
            throw new AppError("Email ja existente!")
        }

        const hashedPassword = await hash(password, 8)

        await knex('users').insert({
            name,
            email,
            password: hashedPassword
        })

        return response.status(201).json()
    }


    async update(request, response) {
        const { name, email, password, old_password } = request.body;
        const { id } = request.params;

        const userList = await knex('users').where('id', id);
        const user = userList[0]


        if (!user) {
            throw new AppError("Usuário não encontrado!");
        }

        const userWithUpdateEmailList = await knex('users').where('email', email);
        const userWithUpdateEmail = userWithUpdateEmailList[0]

        if (userWithUpdateEmail && userWithUpdateEmail.id !== user.id) {
            throw new AppError("Este email ja está em uso.")
        }

        user.name = name ?? user.name
        user.email = email ?? user.email

        if(password && !old_password){
            throw new AppError("É preciso definir a senha antiga para redefinir a nova") 
        }


        if(password && old_password){
            const checkedOldPassword  = await compare(old_password, user.password)

            if(!checkedOldPassword){
                throw new AppError("Senha antiga incorreta!")
            }

            user.password = await hash(password, 8)
        }

        await knex('users').where('id', id).update({
            name,
            email,
            password : user.password,
            updated_at: new Date().toISOString().slice(0, 19).replace('T', ' ') 
        })     

        return response.json();
    }
}

module.exports = UsersController;