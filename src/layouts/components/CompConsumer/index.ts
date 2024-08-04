import { type VNode, cloneVNode, createVNode, defineComponent, h, KeepAlive } from "vue"
import { useRoute } from "vue-router"
import { useTagsViewStore } from "@/store/modules/tags-view"

interface CompConsumerProps {
  component: VNode
}

/** Define the compMap object to store route names and corresponding components */
const compMap = new Map<string, VNode>()

/**
 * CompConsumer component
 * Usage: Replace the <keep-alive> tag and internal code to: <CompConsumer :component="Component" />
 * Advantages: When caching routes, only the route name needs to be written, and no component name needs to be written
 * Disadvantages: When the routing table has dynamic route matching (pointing to the same component), components will be reused (for example, when /info/1 is modified, /info/2 will also change)
 */
export const CompConsumer = defineComponent(
  (props: CompConsumerProps) => {
    const tagsViewStore = useTagsViewStore()
    const route = useRoute()
    return () => {
      // Get the passed component
      const component = props.component
      // Check if name is currently included. If not, just discard name
      if (!route.name) return component
      // Get the name of the current component
      const compName = (component.type as any)?.name
      // Get the name of the current route
      const routeName = route.name as string
      let Comp: VNode
      // Check if the corresponding component already exists in compMap
      if (compMap.has(routeName)) {
        // If it exists, use the component directly for rendering
        Comp = compMap.get(routeName)!
      } else {
        // If it does not exist, clone the passed component and create a new component and add it to compMap
        const node = cloneVNode(component)
        if (compName && compName === routeName) {
          ;(node.type as any).name = `__${compName}__CUSTOM_NAME`
        }
        // @ts-expect-error this is VNode
        Comp = defineComponent({
          name: routeName,
          setup() {
            return () => node
          }
        })
        compMap.set(routeName, Comp)
      }
      // Use the createVNode function to create a KeepAlive component and cache the corresponding component in the cachedViews array
      return createVNode(
        KeepAlive,
        {
          include: tagsViewStore.cachedViews
        },
        {
          default: () => h(Comp)
        }
      )
    }
  },
  {
    name: "CompConsumer",
    props: ["component"]
  }
)
