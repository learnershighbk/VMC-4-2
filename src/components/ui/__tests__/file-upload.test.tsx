import { describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { render, screen } from '@/test-utils';
import { FileUpload } from '../file-upload';

describe('FileUpload', () => {
  it('렌더링되어야 함', () => {
    const handleFileChange = vi.fn();
    render(
      <FileUpload onFileChange={handleFileChange}>
        <p>파일을 업로드하세요</p>
      </FileUpload>
    );
    expect(screen.getByText('파일을 업로드하세요')).toBeInTheDocument();
  });

  it('클릭 시 파일 선택 다이얼로그가 열려야 함', async () => {
    const user = userEvent.setup();
    const handleFileChange = vi.fn();
    const { container } = render(
      <FileUpload onFileChange={handleFileChange}>
        <p>클릭하세요</p>
      </FileUpload>
    );
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toBeInTheDocument();
    
    const clickSpy = vi.spyOn(input, 'click');
    const wrapper = container.firstChild as HTMLElement;
    await user.click(wrapper);
    
    expect(clickSpy).toHaveBeenCalled();
  });

  it('파일 선택 시 onFileChange가 호출되어야 함', async () => {
    const user = userEvent.setup();
    const handleFileChange = vi.fn();
    const { container } = render(
      <FileUpload onFileChange={handleFileChange} accept=".csv" />
    );
    
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(['test content'], 'test.csv', { type: 'text/csv' });
    
    await user.upload(input, file);
    
    expect(handleFileChange).toHaveBeenCalledWith(file);
  });

  it('accept prop이 적용되어야 함', () => {
    const handleFileChange = vi.fn();
    const { container } = render(
      <FileUpload onFileChange={handleFileChange} accept=".csv,.xlsx" />
    );
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;
    expect(input).toHaveAttribute('accept', '.csv,.xlsx');
  });
});

