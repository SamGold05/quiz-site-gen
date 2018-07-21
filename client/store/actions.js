export default {
  nuxtServerInit (store, context) {
    let client = context.app.apolloProvider.defaultClient
    console.log(process.client);
  }
}