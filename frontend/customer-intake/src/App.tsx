import { Survey } from './components/Survey'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

const queryClient = new QueryClient();

function App() {
  return (
    <div>
      <QueryClientProvider client={queryClient}>
        <Survey />
        { //<ReactQueryDevtools initialIsOpen={true} />
        }
      </QueryClientProvider>
      
    </div>
  )
}

export default App
