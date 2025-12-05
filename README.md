# Honold: A flash store for Hono applications

A Laravel-inspired flash store for Hono applications.

Flash messages and old input values are stored in cookies and are available for
the next request only. Don't store sensitive data in flash messages or old
inputs!

## Installation

```bash
deno add jsr:@wuespace/honold
```

## Usage

```tsx
import { Hono } from "@hono/hono";
import { flash, flashInputs, getFlash, honold, old } from "@wuespace/honold";

const app = new Hono()
  .use(honold())
  .get("/", (c) => {
    return c.render(
      <form action="/submit" method="post">
        {getFlash("error")?.map((msg) => <div style="color: red;" key={msg}>{msg}</div>)}
        {getFlash("success")?.map((msg) => (
          <div style="color: green;" key={msg}>{msg}</div>
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
```

You can also use

```tsx
import { textInputProps } from "jsr:@wuespace/honold";

<input {...textInputProps("name", "Default value")} placeholder="Name" />;
```

instead of manually setting all attributes.

## Limitations

`File` inputs are not flashed when calling `flashInputs()`.

## License

MIT License. See [LICENSE](./LICENSE) for details.
