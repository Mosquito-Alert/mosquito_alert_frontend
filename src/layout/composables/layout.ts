import { computed, reactive } from 'vue'

type LayoutConfig = {
  preset: string
  primary: string
  surface: string | null
  darkTheme: boolean
  menuMode: 'static' | 'overlay' | string
}

type LayoutState = {
  staticMenuDesktopInactive: boolean
  overlayMenuActive: boolean
  profileSidebarVisible: boolean
  configSidebarVisible: boolean
  staticMenuMobileActive: boolean
  menuHoverActive: boolean
  activeMenuItem: any // You can replace 'any' with a more specific type if you know what it is
}

const layoutConfig: LayoutConfig = reactive({
  preset: 'Aura',
  primary: 'emerald',
  surface: null,
  darkTheme: false,
  menuMode: 'static',
})

const layoutState: LayoutState = reactive({
  staticMenuDesktopInactive: false,
  overlayMenuActive: false,
  profileSidebarVisible: false,
  configSidebarVisible: false,
  staticMenuMobileActive: false,
  menuHoverActive: false,
  activeMenuItem: null,
})

export function useLayout() {
  const setActiveMenuItem = (item: any) => {
    layoutState.activeMenuItem = item.value ?? item
  }

  const toggleMenu = () => {
    if (layoutConfig.menuMode === 'overlay') {
      layoutState.overlayMenuActive = !layoutState.overlayMenuActive
    }

    if (window.innerWidth > 991) {
      layoutState.staticMenuDesktopInactive =
        !layoutState.staticMenuDesktopInactive
    } else {
      layoutState.staticMenuMobileActive = !layoutState.staticMenuMobileActive
    }
  }

  const isSidebarActive = computed(
    () => layoutState.overlayMenuActive || layoutState.staticMenuMobileActive,
  )

  return {
    layoutConfig,
    layoutState,
    toggleMenu,
    isSidebarActive,
    setActiveMenuItem,
  }
}
