const dateFormatter = new Intl.DateTimeFormat("en-US")

export const formatDate = (dateString: string) => {
  if (!dateString) {
    return ""
  }

  const date = new Date(dateString)
  return dateFormatter.format(date)
}

export const serializeDate = (date: Date) => {
  return date.toISOString()
}
