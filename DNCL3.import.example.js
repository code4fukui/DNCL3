{
  const module = await import("./rnd.js");
  console.log(module);
  const rnd = module.rnd;
  console.log(rnd(100));
}
{
  const { rnd } = await import("./rnd.js");
  console.log(rnd(100));
}