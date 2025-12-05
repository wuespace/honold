export class MockContext {
  private headers = new Map<string, string>();

  header(name: string, value: string) {
    this.headers.set(name, value);
  }

  req = {
    raw: {
      headers: {
        get: (name: string) => this.headers.get(name) || null,
      },
    },
  };
}
