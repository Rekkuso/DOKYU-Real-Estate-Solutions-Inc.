import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getPublicListingById, getSimilarListings } from "../../../_actions/listing";
import PropertyDetailClient from "../../../_components/PropertyDetailClient";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = await getPublicListingById(Number(id));

  if (!listing) {
    return {
      title: "Property Not Found | DOKYU Real Estate",
    };
  }

  const description = `${listing.title} — ${listing.tag} in ${listing.location}. ${listing.beds} Beds, ${listing.baths} Baths, ${listing.area}. Priced at ₱${listing.price.toLocaleString()}.`;

  return {
    title: `${listing.title} | DOKYU Real Estate`,
    description,
    openGraph: {
      title: listing.title,
      description,
      images: listing.images.length > 0 ? [listing.images[0]] : [],
      type: "website",
    },
  };
}

export default async function PropertyDetailPage({ params }: Props) {
  const { id } = await params;
  const numericId = Number(id);

  if (isNaN(numericId)) {
    notFound();
  }

  const listing = await getPublicListingById(numericId);

  if (!listing) {
    notFound();
  }

  const similarListings = await getSimilarListings(
    listing.id,
    listing.type,
    3,
  );

  return (
    <PropertyDetailClient
      listing={listing}
      similarListings={similarListings}
    />
  );
}
