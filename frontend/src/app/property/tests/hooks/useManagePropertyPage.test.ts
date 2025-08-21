// src/app/property/tests/hooks/useManagePropertyPage.test.ts
import { renderHook, waitFor } from "@testing-library/react";
import { vi, Mock } from "vitest";
import { useManagePropertyPage } from "../../hooks/useManagePropertyPage";
import * as propertyService from "../../services/property.service";
import * as ownerService from "../../services/owner.service";
import * as imageService from "../../../shared/components/images/image.service";
import { usePropertiesContext } from "../../context/PropertiesContext";
import { useImages } from "../../../shared/hooks/useImages";
import { useConfirmDialog } from "../../../shared/components/ConfirmDialog";
import { useGlobalAlert } from "../../../shared/context/AlertContext";
import { useNavigate, useParams } from "react-router-dom";

// ─── mocks de router ───
vi.mock("react-router-dom", () => ({
  useNavigate: vi.fn(),
  useParams: vi.fn(),
}));

// ─── mocks de servicios ───
vi.mock("../../services/property.service");
vi.mock("../../services/owner.service");
vi.mock("../../../shared/components/images/image.service");

// ─── mocks de hooks ───
vi.mock("../../../shared/hooks/useImages");
vi.mock("../../context/PropertiesContext");
vi.mock("../../../shared/components/ConfirmDialog");
vi.mock("../../../shared/context/AlertContext");

describe("useManagePropertyPage hook", () => {
  const mockNavigate = vi.fn();
  const mockUseParams = useParams as unknown as Mock;
  const mockAsk = vi.fn((callback: () => void) => callback());
  const mockShowAlert = vi.fn();
  const mockSetSelected = vi.fn();
  const mockResetSelected = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // router
    (useNavigate as unknown as Mock).mockReturnValue(mockNavigate);
    mockUseParams.mockReturnValue({ id: "1" });

    // confirm dialog
    (useConfirmDialog as unknown as Mock).mockReturnValue({
      ask: mockAsk,
      DialogUI: null,
    });

    // global alert
    (useGlobalAlert as unknown as Mock).mockReturnValue({
      showAlert: mockShowAlert,
    });

    // properties context
    (usePropertiesContext as unknown as Mock).mockReturnValue({
      setSelected: mockSetSelected,
      resetSelected: mockResetSelected,
      selected: { owner: 1, type: 2, neighborhood: 3, amenities: [4] },
    });

    // images hook
    (useImages as unknown as Mock).mockReturnValue({
      mainImage: null,
      gallery: [],
      setMain: vi.fn(),
      addToGallery: vi.fn(),
      remove: vi.fn(),
    });

    // servicios
    (propertyService.getPropertyById as unknown as Mock) = vi.fn();
    (ownerService.getOwnerByPropertyId as unknown as Mock) = vi.fn();
    (imageService.getImagesByPropertyId as unknown as Mock) = vi.fn();
  });

  it("carga inicial con propiedad y llama servicios", async () => {
    interface FakeAmenity { id: number }
    interface FakeType { id: number; name: string }
    interface FakeProperty {
      id: number
      type: FakeType
      mainImage: string
      amenities: FakeAmenity[]
      neighborhood: { id: number } | null
    }
    interface FakeOwner { id: number }
    interface FakeImage { id: number; url: string }

    const fakeProp: FakeProperty = {
      id: 1,
      type: { id: 2, name: "Casa" },
      mainImage: "main.jpg",
      amenities: [{ id: 4 }],
      neighborhood: null,
    };
    const fakeOwner: FakeOwner = { id: 1 };
    const fakeImgs: FakeImage[] = [{ id: 10, url: "img1.jpg" }];

    (propertyService.getPropertyById as unknown as Mock).mockResolvedValue(
      fakeProp
    );
    (ownerService.getOwnerByPropertyId as unknown as Mock).mockResolvedValue(
      fakeOwner
    );
    (imageService.getImagesByPropertyId as unknown as Mock).mockResolvedValue(
      fakeImgs
    );

    const { result } = renderHook(() => useManagePropertyPage());

    await waitFor(() => {
      expect(result.current.property).toEqual({ ...fakeProp, owner: fakeOwner });
    });

    expect(mockSetSelected).toHaveBeenCalledWith({
      owner: fakeOwner.id,
      type: fakeProp.type.id,
      neighborhood: fakeProp.neighborhood?.id ?? null,
      amenities: [4],
    });
  });

});
