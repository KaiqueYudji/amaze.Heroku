import express from 'express'
import db from '../db.js';

import Sequelize from "sequelize";
const { fn } = Sequelize;

const app = express.Router();


function Map(array){

  let consulta = array.map( item =>{
    return{
        id:item.id_usuario,
        usuario: item.nm_usuario,
        email: item.ds_email,
        telefone: item.nr_telefone,
        senha: item.ds_senha,
        ativo: item.bt_ativo
    }
  }) 
  return consulta;

}


app.get('/user', async(req, resp) =>{
  try{
    let id = req.query.id;

    let r = await db.infob_amz_tbusuario.findOne({
      where:{
        id_usuario: id
      }
    })
    resp.send(r.nm_usuario)
  }catch(e){
    resp.send(e.toString())
  }
})

//Inserir
app.post('/inserir', async(req,resp) =>{
    try{ 
      let usuario = req.body.nm_usuario;
      let email = req.body.ds_email;
      let telefone = req.body.nr_telefone;
      let senha = req.body.ds_senha;
      let ativo = true;

      let arrouba = email.includes('@')

      let especial = senha.includes("@")

      let especial3 = senha.includes('$')

      let especial4 = senha.includes('%')

      let especial5 = senha.includes('*')

      let proibido = senha.includes('#')

      if(proibido === true)
      return resp.send({erro:'Não é permitido o uso de #'})

      if( (especial || especial3 || especial4 || especial5) === false)
      return resp.send({erro: 'A senha precisa ter no mínimo um caractere especial'})

      if(email.length < 12)
       return resp.send({erro:'O email Precisa de no mínimo 12 caracteres'})

       if(arrouba === false)
       return resp.send({erro:'O email Precisa do caractere @'})

       if(senha.length < 5)
       return resp.send({erro:'A senha precisa ter no mínimo 5 caracteres'})

       if(isNaN(telefone) === true)
       return resp.send({erro:'O campo telefone só aceita números'})

       if(telefone.length < 11 || telefone.length >11)
       return resp.send({erro:'O número de telefone está inválido'})
    
      if(telefone === null || senha === null || email === null || usuario === null)
      return resp.send({erro:'Você não pode inserir um campo vazio'})

     
      let consulta = await db.infob_amz_tbusuario.findOne(
        {
            where:{
              ds_senha: senha, 
              ds_email: email
            }
        });
  
       if(consulta != undefined){
         return resp.send({erro:'Esse usuário ja existe'})
       }

       let inserir={
          nm_usuario:usuario,
          ds_email:email,
          nr_telefone:telefone,
          ds_senha:senha,
          bt_ativo: ativo
      }


      let inserting = await db.infob_amz_tbusuario.create(inserir);
      resp.send(inserting)
    }catch(e){
      resp.send(e.toString())
    }
})


// Verificar se o usuário já tem uma conta para efetuar login
app.get('/login',async (req,resp) =>{
  try{
    let senha = req.query.ds_senha;
    let email = req.query.ds_email;
    
      let consulta = await db.infob_amz_tbusuario.findOne(
      {
          where:{
            ds_senha: senha, 
            ds_email: email
          }
      });

     if(consulta == null || undefined){
       return resp.send({erro:'Usuário ou Senha inválido'})
     }

      resp.send(consulta)
  }catch(e){
      resp.send(e)
  }
})



// get TOTAL
app.get('/total/:id',async (req,resp) =>{

      try{
            let id = req.params.id
            let consulta = await db.infob_amz_tbusuario.findAll({ 
              where:{
                bt_ativo: false
              },
              order:[['id_usuario']]
            });

            let total = await db.infob_amz_tbreporte_denuncia.findAll({
              attributes: [
                [fn('count', 1), 'qtd']
              ]
            })

            let final = Map(consulta)
            console.log(total.qtd)
            resp.send({
              final: final,
              total: total
            })
      }catch(e){
          resp.send(e.toString())
      }
  })
  

  app.get('/email',async (req,resp) =>{

    let email = req.query.email;
    
    try{
         let consulta = await db.infob_amz_tbusuario.findOne({
           where:{ds_email:email}
         });

         let object ={
           idusu:consulta.id_usuario
         }

         resp.send(object)
    }catch(e){
        resp.send(e.toString())
    }
})





app.delete('/del/:id', async (req,resp) =>{
try{
  let id = req.params.id;
  

     let denu = await db.infob_amz_tbdenuncia.destroy({
        where:{id_usuario: id}
     })

     let usu = await db.infob_amz_tbusuario.destroy({
       where:{id_usuario: id}
      })
      resp.sendStatus(200)
    }catch(e){
        resp.send(e.toString())
      }
 
})

//Alterar Senha
app.put('senha/:id', async(req,resp) =>{
  let id= req.params.id

  let senha = req.body.ds_senha;

  if(senha.length < 5)
     return resp.send({erro:'A senha precisa ter no mínimo 10 caracteres'})

  if(especial === false)
        return resp.send({erro:'a senha precisar ter no mínimo 1 caractere especial'})

  let alterar = db.infob_amz_tbusuario.update({
    ds_senha:senha
  },
  {
    where: {id_usuario: id}
  })

  resp.sendStatus(200)

})

// desligar usuário do sistema
app.put('/usuarioFalse/:id', async(req,resp) =>{
  try{
  let id= req.params.id
  
  let ativo = req.body.bt_ativo;
  
  let alterar = db.infob_amz_tbusuario.update({
    bt_ativo:ativo
  },
  {
    where: {id_usuario: id}
  })

  resp.sendStatus(200)
  }catch(e){
   resp.send(e.ToString())
  }


})


export default app