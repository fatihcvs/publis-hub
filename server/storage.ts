import { db } from "./db";
import { eq } from "drizzle-orm";
import {
  profile,
  socialLinks,
  sponsors,
  discountCodes,
  type Profile,
  type SocialLink,
  type Sponsor,
  type DiscountCode,
  type InsertProfile,
  type InsertSocialLink,
  type InsertSponsor,
  type InsertDiscountCode,
} from "@shared/schema";

export interface IStorage {
  getProfile(): Promise<Profile | undefined>;
  createProfile(data: InsertProfile): Promise<Profile>;
  updateProfile(id: string, data: Partial<InsertProfile>): Promise<Profile | undefined>;

  getSocialLinks(): Promise<SocialLink[]>;
  createSocialLink(data: InsertSocialLink): Promise<SocialLink>;
  updateSocialLink(id: string, data: Partial<InsertSocialLink>): Promise<SocialLink | undefined>;
  deleteSocialLink(id: string): Promise<void>;

  getSponsors(): Promise<Sponsor[]>;
  createSponsor(data: InsertSponsor): Promise<Sponsor>;
  updateSponsor(id: string, data: Partial<InsertSponsor>): Promise<Sponsor | undefined>;
  deleteSponsor(id: string): Promise<void>;

  getDiscountCodes(): Promise<DiscountCode[]>;
  createDiscountCode(data: InsertDiscountCode): Promise<DiscountCode>;
  updateDiscountCode(id: string, data: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined>;
  deleteDiscountCode(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getProfile(): Promise<Profile | undefined> {
    const [result] = await db.select().from(profile).limit(1);
    return result;
  }

  async createProfile(data: InsertProfile): Promise<Profile> {
    const [result] = await db.insert(profile).values(data).returning();
    return result;
  }

  async updateProfile(id: string, data: Partial<InsertProfile>): Promise<Profile | undefined> {
    const [result] = await db.update(profile).set(data).where(eq(profile.id, id)).returning();
    return result;
  }

  async getSocialLinks(): Promise<SocialLink[]> {
    return db.select().from(socialLinks);
  }

  async createSocialLink(data: InsertSocialLink): Promise<SocialLink> {
    const [result] = await db.insert(socialLinks).values(data).returning();
    return result;
  }

  async updateSocialLink(id: string, data: Partial<InsertSocialLink>): Promise<SocialLink | undefined> {
    const [result] = await db.update(socialLinks).set(data).where(eq(socialLinks.id, id)).returning();
    return result;
  }

  async deleteSocialLink(id: string): Promise<void> {
    await db.delete(socialLinks).where(eq(socialLinks.id, id));
  }

  async getSponsors(): Promise<Sponsor[]> {
    return db.select().from(sponsors);
  }

  async createSponsor(data: InsertSponsor): Promise<Sponsor> {
    const [result] = await db.insert(sponsors).values(data).returning();
    return result;
  }

  async updateSponsor(id: string, data: Partial<InsertSponsor>): Promise<Sponsor | undefined> {
    const [result] = await db.update(sponsors).set(data).where(eq(sponsors.id, id)).returning();
    return result;
  }

  async deleteSponsor(id: string): Promise<void> {
    // First, unlink any discount codes that reference this sponsor
    await db.update(discountCodes).set({ sponsorId: null }).where(eq(discountCodes.sponsorId, id));
    // Then delete the sponsor
    await db.delete(sponsors).where(eq(sponsors.id, id));
  }

  async getDiscountCodes(): Promise<DiscountCode[]> {
    return db.select().from(discountCodes);
  }

  async createDiscountCode(data: InsertDiscountCode): Promise<DiscountCode> {
    const [result] = await db.insert(discountCodes).values(data).returning();
    return result;
  }

  async updateDiscountCode(id: string, data: Partial<InsertDiscountCode>): Promise<DiscountCode | undefined> {
    const [result] = await db.update(discountCodes).set(data).where(eq(discountCodes.id, id)).returning();
    return result;
  }

  async deleteDiscountCode(id: string): Promise<void> {
    await db.delete(discountCodes).where(eq(discountCodes.id, id));
  }
}

export const storage = new DatabaseStorage();
