import Icon from "~/components/CustomIcons/Icon"
import ThreeDotsLoader from "~/components/CustomIcons/ThreeDotsLoader"

export interface TreeItem {
  id: string
  title: string
  icon?: React.ReactElement
  status?: React.ReactElement | string
  children?: TreeItem[]
}

export interface TreeItemData<T> extends Omit<TreeItem, "children"> {
  children?: TreeItemData<T>[]
  data: T
}

export interface ListItem {
  id: string
  number?: string
  title?: string
  dmetadata?: Record<string, any>
  icon?: string
  data?: string
}

export interface ActionItem {
  id: string
  parent_id?: string
  data?: string
  icon?: string
  dmetadata?: Record<string, any>
  loading?: boolean
}

export function buildSectionTree(list: ListItem[], expanded: boolean = false): TreeItemData<ListItem>[] {
  /*
    Optimized function to build a tree based on section numbers (e.g. 1.1, 1.1.2, etc.)
    Uses Map for faster lookups and reduces parent searching complexity
  */
  const allNodes = new Map<string, TreeItemData<ListItem>>()
  const roots: TreeItemData<ListItem>[] = []

  // First pass: create all nodes
  for (const item of list) {
    const newNode: TreeItemData<ListItem> = {
      id: item.id,
      title: expanded ? `${item.number} ${item.title}` : item.number!,
      status: item.dmetadata?.["page"] ? `${item.dmetadata?.["page"]}` : undefined,
      data: item,
      children: [],
    }

    allNodes.set(item.number!, newNode)
  }

  // Second pass: build parent-child relationships
  for (const item of list) {
    const node = allNodes.get(item.number!)

    // For root nodes (no dots)
    if (!item.number!.includes(".")) {
      roots.push(node!)
      continue
    }

    // Find direct parent by removing the last segment
    const lastDotIndex = item.number!.lastIndexOf(".")
    const parentNumber = item.number!.substring(0, lastDotIndex)
    const parentNode = allNodes.get(parentNumber)

    if (parentNode) {
      parentNode.children!.push(node!)
    } else {
      // If parent not found, treat as root
      roots.push(node!)
    }
  }

  // Clean up empty children arrays
  for (const [_, node] of allNodes) {
    if (node.children?.length === 0) {
      delete node.children
    }
  }

  return roots
}

const supportedIcons = {
  TbWriting: Icon.TbWriting,
  AiOutlineFileSearch: Icon.AiOutlineFileSearch,
  TfiWrite: Icon.TfiWrite,
  TbSection: Icon.TbSection,
  BiErrorAlt: Icon.BiErrorAlt,
  SiWritedotas: Icon.SiWritedotas,
  MdOutlineQuickreply: Icon.MdOutlineQuickreply,
  RiDraftLine: Icon.RiDraftLine,
  BiCheck: Icon.BiCheck,
  AiOutlineStop: Icon.AiOutlineStop,
  GrDocumentStore: Icon.GrDocumentStore,
}

export function buildActionTree(list: ActionItem[]): TreeItemData<ActionItem>[] {
  const allNodes = new Map<string, TreeItemData<ActionItem>>()
  const roots: TreeItemData<ActionItem>[] = []

  // Create all nodes first
  for (const item of list) {
    const icon = item.icon || "BiQuestionMark"
    const IconComponent = supportedIcons[icon as keyof typeof supportedIcons] || Icon.BiErrorAlt

    let status = <Icon.BiCheck />
    if (item.loading) {
      status = <ThreeDotsLoader />
    } else if (item.dmetadata?.result) {
      status = item.dmetadata?.result
    } else if (item.dmetadata?.cancelled) {
      status = <Icon.AiOutlineStop />
    }

    const newNode: TreeItemData<ActionItem> = {
      id: item.id,
      title: item.data || "Unknown action",
      icon: <IconComponent />,
      status,
      data: item,
      children: [],
    }

    allNodes.set(item.id, newNode)
  }

  // Build parent-child relationships in a single pass
  for (const item of list) {
    const node = allNodes.get(item.id)

    if (!item.parent_id) {
      // No parent, this is a root node
      roots.push(node!)
    } else {
      const parent = allNodes.get(item.parent_id)
      if (parent) {
        parent.children!.push(node!)
      } else {
        // Parent not found, treat as root
        roots.push(node!)
      }
    }
  }

  // Clean up empty children arrays
  for (const [_, node] of allNodes) {
    if (node.children?.length === 0) {
      delete node.children
    }
  }

  return roots
}
