import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test-utils';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '../card';

describe('Card Components', () => {
  it('Card가 렌더링되어야 함', () => {
    render(<Card>테스트 컨텐츠</Card>);
    expect(screen.getByText('테스트 컨텐츠')).toBeInTheDocument();
  });

  it('CardHeader가 렌더링되어야 함', () => {
    render(
      <Card>
        <CardHeader>헤더</CardHeader>
      </Card>
    );
    expect(screen.getByText('헤더')).toBeInTheDocument();
  });

  it('CardTitle이 렌더링되어야 함', () => {
    render(
      <Card>
        <CardTitle>타이틀</CardTitle>
      </Card>
    );
    expect(screen.getByText('타이틀')).toBeInTheDocument();
  });

  it('CardDescription이 렌더링되어야 함', () => {
    render(
      <Card>
        <CardDescription>설명</CardDescription>
      </Card>
    );
    expect(screen.getByText('설명')).toBeInTheDocument();
  });

  it('CardContent가 렌더링되어야 함', () => {
    render(
      <Card>
        <CardContent>컨텐츠</CardContent>
      </Card>
    );
    expect(screen.getByText('컨텐츠')).toBeInTheDocument();
  });

  it('CardFooter가 렌더링되어야 함', () => {
    render(
      <Card>
        <CardFooter>푸터</CardFooter>
      </Card>
    );
    expect(screen.getByText('푸터')).toBeInTheDocument();
  });

  it('전체 Card 구조가 올바르게 렌더링되어야 함', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>제목</CardTitle>
          <CardDescription>설명</CardDescription>
        </CardHeader>
        <CardContent>내용</CardContent>
        <CardFooter>푸터</CardFooter>
      </Card>
    );
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('설명')).toBeInTheDocument();
    expect(screen.getByText('내용')).toBeInTheDocument();
    expect(screen.getByText('푸터')).toBeInTheDocument();
  });
});

