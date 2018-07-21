const { GraphQLServer } = require('graphql-yoga')
const { Prisma } = require('prisma-binding')
const bodyParser = require('body-parser')
const fs = require('fs')
const path = require('path')

const resolvers = {
  Query: {
    posts: (_, args, context, info) => {
      return context.prisma.query.posts(
        {
          where: {
            OR: [
              { title_contains: args.searchString },
              { content_contains: args.searchString },
            ],
          },
        },
        info,
      )
    },
    user: (_, args, context, info) => {
      return context.prisma.query.user(
        {
          where: {
            id: args.id,
          },
        },
        info,
      )
    },
    templateData: (_, args, context, info) => {
      return context.prisma.query.templateData(
        {
          where: {
            id: args.id,
          },
        },
        info,
      )
    },
    templateDatas: (_, args, context, info) => {
      return context.prisma.query.templateDatas(
        null,
        info,
      )
    },
  },
  Mutation: {
    generate: (_, args, context, info) => {
      return context.prisma.mutation.createTemplateData(
        {
          data: {
            name: args.name,
          },
        },
        info,
      )
    },
    createDraft: (_, args, context, info) => {
      return context.prisma.mutation.createPost(
        {
          data: {
            title: args.title,
            content: args.content,
            author: {
              connect: {
                id: args.authorId,
              },
            },
          },
        },
        info,
      )
    },
    publish: (_, args, context, info) => {
      return context.prisma.mutation.updatePost(
        {
          where: {
            id: args.id,
          },
          data: {
            published: true,
          },
        },
        info,
      )
    },
    deletePost: (_, args, context, info) => {
      return context.prisma.mutation.deletePost(
        {
          where: {
            id: args.id,
          },
        },
        info,
      )
    },
    signup: (_, args, context, info) => {
      return context.prisma.mutation.createUser(
        {
          data: {
            name: args.name,
          },
        },
        info,
      )
    },
  },
}

const server = new GraphQLServer({
  typeDefs: 'src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    prisma: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'http://localhost:4466',
    }),
  }),
})

server.start(() => console.log(`GraphQL server is running on http://localhost:4000`))

const { prisma } = server.context() 
const app = server.express 

app.set('view engine', 'pug')
app.set('view options', {pretty: true})

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

app.get('/preview/:id', async (req, res) => {
  // fs.writeFile('dist/index.html', html, (err) => {
  //   if (err) throw err
  //   console.log('The file has been saved!');
  // })
  // const query = `
  //   query ($id: ID!){
  //     templateData(where: {id: $id}) {
  //       id
  //       name
  //     }
  //   }
  // `
  // const variables = { id: req.params.id }

  // const { templateData } = await prisma.request(query, variables)
  
  const templateData = await prisma.query.templateData({where: { id: req.params.id } }, '{ name }');

  res.render('index', templateData);
})