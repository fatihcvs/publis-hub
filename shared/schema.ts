import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export * from "./models/auth";

export const profile = pgTable("profile", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  title: text("title").notNull(),
  bio: text("bio").notNull(),
  avatarUrl: text("avatar_url"),
  themeColor: text("theme_color").default("#7c3aed"),
  backgroundImageUrl: text("background_image_url"),
  backgroundBlur: integer("background_blur").default(0),
  cardOpacity: integer("card_opacity").default(80), // 0-100
  // Bio Card Fields
  bioTitle: text("bio_title"),
  bioTitleColor: text("bio_title_color").default("#000000"),
  bioBody: text("bio_body"),
  bioBodyColor: text("bio_body_color").default("#333333"),
  bioFooter: text("bio_footer"),
  bioFooterColor: text("bio_footer_color").default("#ff0000"),
  bioBorderColor: text("bio_border_color"),
  bioBackgroundColor: text("bio_background_color").default("#fffBEB"),
  // Site Branding
  siteTitle: text("site_title").default("Link Hub"),
  faviconUrl: text("favicon_url"),
  // Global Design Fields
  fontFamily: text("font_family").default("Nunito"),
  borderRadius: text("border_radius").default("2rem"),
  floatingEmojis: boolean("floating_emojis").default(false),
  // Kick Widget
  kickUsername: text("kick_username"),
  kickAutoplay: boolean("kick_autoplay").default(true),
  // Announcement Banner
  announcementText: text("announcement_text"),
  announcementEnabled: boolean("announcement_enabled").default(false),
  announcementColor: text("announcement_color").default("#7c3aed"),
  // Custom CTA Button
  ctaButtonText: text("cta_button_text"),
  ctaButtonUrl: text("cta_button_url"),
  ctaButtonEnabled: boolean("cta_button_enabled").default(false),
  // Statistics Display
  statsEnabled: boolean("stats_enabled").default(false),
  statsFollowers: text("stats_followers"),
  statsViews: text("stats_views"),
  // Layout Builder Config
  // Format: [{ id: "bio", visible: true, width: "full" }, ...]
  layoutConfig: jsonb("layout_config").$type<{ id: string; visible: boolean; width: "full" | "half" }[]>(),
  // League of Legends Widget
  lolSummonerName: text("lol_summoner_name"),
  lolRegion: text("lol_region").default("TR1"),
  lolRiotTag: text("lol_riot_tag").default("EUW"),
  lolWidgetEnabled: boolean("lol_widget_enabled").default(false),
  lolWidgetSettings: jsonb("lol_widget_settings").$type<{
    showLastMatches: boolean;
    matchCount: number;
    showRank: boolean;
    showTopChampions: boolean;
    showWinrate: boolean;
    cardColor: string;
    accentColor: string;
  }>(),
  riotApiKey: text("riot_api_key"),
});

export const socialLinks = pgTable("social_links", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  followerCount: text("follower_count"),
  badge: text("badge"),
  description: text("description"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  // Layout & Style
  colSpan: integer("col_span").notNull().default(2), // 1 or 2 (2 is full width)
  customBgColor: text("custom_bg_color"),
  customTextColor: text("custom_text_color"),
  displayStyle: text("display_style").default("standard"), // 'standard' (large), 'grid' (vertical), 'icon' (round)
});

export const sponsors = pgTable("sponsors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  logoUrl: text("logo_url"),
  websiteUrl: text("website_url").notNull(),
  code: text("code"),
  discountPercent: integer("discount_percent"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  // Layout & Style
  colSpan: integer("col_span").notNull().default(2), // 1 or 2 (2 is full width)
  customBgColor: text("custom_bg_color"),
  customTextColor: text("custom_text_color"),
});

export const discountCodes = pgTable("discount_codes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sponsorId: varchar("sponsor_id").references(() => sponsors.id),
  code: text("code").notNull(),
  description: text("description"),
  discountPercent: integer("discount_percent"),
  url: text("url"),
  logoUrl: text("logo_url"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const games = pgTable("games", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  platform: text("platform"),
  url: text("url"),
  logoUrl: text("logo_url"),
  displayOrder: integer("display_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
});

export const insertProfileSchema = createInsertSchema(profile).omit({ id: true });
export const insertSocialLinkSchema = createInsertSchema(socialLinks).omit({ id: true });
export const insertSponsorSchema = createInsertSchema(sponsors).omit({ id: true });
export const insertDiscountCodeSchema = createInsertSchema(discountCodes).omit({ id: true });
export const insertGameSchema = createInsertSchema(games).omit({ id: true });

export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type InsertSocialLink = z.infer<typeof insertSocialLinkSchema>;
export type InsertSponsor = z.infer<typeof insertSponsorSchema>;
export type InsertDiscountCode = z.infer<typeof insertDiscountCodeSchema>;
export type InsertGame = z.infer<typeof insertGameSchema>;

export type Profile = typeof profile.$inferSelect;
export type SocialLink = typeof socialLinks.$inferSelect;
export type Sponsor = typeof sponsors.$inferSelect;
export type DiscountCode = typeof discountCodes.$inferSelect;
export type Game = typeof games.$inferSelect;
