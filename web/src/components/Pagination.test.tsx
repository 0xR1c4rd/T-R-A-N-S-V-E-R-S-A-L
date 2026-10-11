import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { Pagination } from "./Pagination";

afterEach(cleanup);

describe("Pagination", () => {
  it("n'affiche rien quand il n'y a qu'une seule page", () => {
    const { container } = render(
      <Pagination page={1} limit={12} total={10} onPageChange={() => undefined} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("affiche la page courante et le nombre total de pages", () => {
    render(<Pagination page={2} limit={12} total={40} onPageChange={() => undefined} />);
    expect(screen.getByText(/Page 2 \/ 4/)).toBeTruthy();
  });

  it("désactive « Précédent » sur la première page", () => {
    render(<Pagination page={1} limit={12} total={40} onPageChange={() => undefined} />);
    const bouton = screen.getByRole("button", { name: /Précédent/ }) as HTMLButtonElement;
    expect(bouton.disabled).toBe(true);
  });

  it("désactive « Suivant » sur la dernière page", () => {
    render(<Pagination page={4} limit={12} total={40} onPageChange={() => undefined} />);
    const bouton = screen.getByRole("button", { name: /Suivant/ }) as HTMLButtonElement;
    expect(bouton.disabled).toBe(true);
  });

  it("appelle onPageChange avec la page suivante / précédente", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={2} limit={12} total={40} onPageChange={onPageChange} />);

    fireEvent.click(screen.getByRole("button", { name: /Suivant/ }));
    expect(onPageChange).toHaveBeenLastCalledWith(3);

    fireEvent.click(screen.getByRole("button", { name: /Précédent/ }));
    expect(onPageChange).toHaveBeenLastCalledWith(1);
  });
});