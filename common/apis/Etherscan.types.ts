export interface AddressMetadataAPI {
  status: string;
  message: string;
  result?: AddressMetadata[];
}

interface AddressMetadata {
  address: string;
  nametag: string;
  internal_nametag: string;
  url: string;
  shortdescription: string;
  notes_1: string;
  notes_2: string;
  labels: string[];
  labels_slug: string[];
  reputation: number;
  other_attributes: string[];
  lastupdatedtimestamp: number;
}
