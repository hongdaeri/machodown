export const workspacesMigrations = [
  {
    version: 1,
    migrate: (data) => {
      if (!Array.isArray(data)) return []
      return data.map((item) => ({
        id: item.path,
        path: item.path,
        name: item.name ?? item.path.split('/').pop() ?? item.path
      }))
    }
  }
]
