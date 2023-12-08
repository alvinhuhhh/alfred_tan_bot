Deno.serve((req: Request) => {
  console.log(req.method);

  const url = new URL(req.url);
  console.log(url.pathname);

  return new Response("Hello world!");
});
