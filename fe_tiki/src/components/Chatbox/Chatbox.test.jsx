// Import các hàm cần thiết từ thư viện testing
import { render, screen } from '@testing-library/react';
import Chatbox from './Chatbox';

// Viết một test case đơn giản
test('renders chatbox component', () => {
  // Render component Chatbox
  render(<Chatbox />);
  
  // Tìm một phần tử có text là "Chatbot" (tên của chatbox)
  const linkElement = screen.getByText(/Chatbot/i);
  
  // Mong đợi rằng phần tử đó có trong document
  expect(linkElement).toBeInTheDocument();
});
