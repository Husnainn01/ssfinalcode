require('@testing-library/jest-dom')

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '',
      query: '',
      asPath: '',
      push: jest.fn(),
      replace: jest.fn()
    }
  }
}))

// Mock next/image without using JSX
jest.mock('next/image', () => ({
  __esModule: true,
  default: function Image(props) {
    // Return an object instead of JSX
    return Object.assign(
      document.createElement('img'),
      props
    );
  }
})) 