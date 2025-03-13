export const groupBy = (array: any[], key: string, defaultGroup: string = "default") => {
  const map = new Map()

  for (const item of array) {
    const groupKey = item?.[key] ?? defaultGroup

    if (!map.has(groupKey)) {
      map.set(groupKey, [])
    }

    map.get(groupKey).push(item)
  }

  return Object.fromEntries(map)
}
