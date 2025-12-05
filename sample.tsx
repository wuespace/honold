#! /usr/bin/env deno run --allow-net
import { Hono } from "@hono/hono";
import { flash, flashInputs, getFlash, honold, old } from "@wuespace/honold";

const app = new Hono()
  .use(honold())
  .get("/", (c) => {
    return c.render(
      <form action="/submit" method="post">
        {getFlash("error")?.map((msg) => (
          <div key={msg} style="color: red;">{msg}</div>
        ))}
        {getFlash("success")?.map((msg) => (
          <div key={msg} style="color: green;">{msg}</div>
        ))}
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={old("name") ?? ""}
        />
        <button type="submit">Submit</button>
      </form>,
    );
  })
  .post("/submit", async (c) => {
    const form = await c.req.formData();
    const name = form.get("name") as string;
    if (!name || name.length < 5) {
      await flashInputs();
      flash("error", "Name is required and must be at least 5 characters long");
      return c.redirect("/");
    }
    flash("success", "Form submitted successfully");
    return c.redirect("/");
  });

Deno.serve(app.fetch);
