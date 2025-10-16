<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

/**
 * AI Embedding Service for Voyage AI Integration
 * 
 * This service handles all interactions with Voyage AI's embedding API
 * to generate semantic embeddings for job skills and gig worker profiles.
 */
class AIEmbeddingService
{
    private string $apiUrl;
    private string $apiKey;
    private string $baseUrl;
    private string $model;

    public function __construct()
    {
        $this->apiKey = config('services.voyage.api_key');
        $this->baseUrl = config('services.voyage.base_url', 'https://api.voyageai.com/v1');
        $this->model = config('services.voyage.model', 'voyage-3');
        $this->apiUrl = $this->baseUrl . '/embeddings';
    }

    /**
     * Generate embedding for a given text input
     * 
     * @param string $text The text to embed (skills, job description, etc.)
     * @return array|null The embedding vector or null on failure
     */
    public function generateEmbedding(string $text): ?array
    {
        if (empty($this->apiKey)) {
            Log::warning('Voyage AI API key not configured');
            return null;
        }

        // Create cache key for this text
        $cacheKey = 'embedding_' . md5($text);
        
        // Check if embedding is already cached (cache for 24 hours)
        if (Cache::has($cacheKey)) {
            return Cache::get($cacheKey);
        }

        try {
            $response = Http::withoutVerifying()->withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(30)->post($this->apiUrl, [
                'model' => $this->model,
                'input' => $text,
            ]);

            if ($response->successful()) {
                $data = $response->json();
                
                if (isset($data['data'][0]['embedding'])) {
                    $embedding = $data['data'][0]['embedding'];
                    
                    // Cache the embedding for future use
                    Cache::put($cacheKey, $embedding, now()->addHours(24));
                    
                    return $embedding;
                }
            }

            Log::error('Voyage AI API error', [
                'status' => $response->status(),
                'response' => $response->body()
            ]);

        } catch (\Exception $e) {
            Log::error('Voyage AI API exception', [
                'message' => $e->getMessage(),
                'text' => substr($text, 0, 100) // Log first 100 chars for debugging
            ]);
        }

        return null;
    }

    /**
     * Generate embedding for job skills and description
     * 
     * @param array $skills Array of required skills
     * @param string $description Job description
     * @param string $title Job title
     * @return array|null The embedding vector or null on failure
     */
    public function generateJobEmbedding(array $skills, string $description, string $title): ?array
    {
        // Combine skills, title, and description for comprehensive embedding
        $skillsText = implode(', ', $skills);
        $combinedText = "Job Title: {$title}\nRequired Skills: {$skillsText}\nDescription: {$description}";
        
        return $this->generateEmbedding($combinedText);
    }

    /**
     * Generate embedding for gig worker profile
     * 
     * @param array $skills Array of worker skills
     * @param string $bio Worker bio/description
     * @param string $professionalTitle Professional title
     * @param string $experienceLevel Experience level
     * @return array|null The embedding vector or null on failure
     */
    public function generateWorkerEmbedding(array $skills, string $bio, string $professionalTitle, string $experienceLevel): ?array
    {
        // Combine all profile information for comprehensive embedding
        $skillsText = implode(', ', $skills);
        $combinedText = "Professional Title: {$professionalTitle}\nExperience Level: {$experienceLevel}\nSkills: {$skillsText}\nBio: {$bio}";
        
        return $this->generateEmbedding($combinedText);
    }

    /**
     * Calculate cosine similarity between two embedding vectors
     * 
     * @param array $vectorA First embedding vector
     * @param array $vectorB Second embedding vector
     * @return float Similarity score between 0 and 1
     */
    public function cosineSimilarity(array $vectorA, array $vectorB): float
    {
        if (count($vectorA) !== count($vectorB)) {
            return 0.0;
        }

        $dotProduct = 0.0;
        $normA = 0.0;
        $normB = 0.0;

        for ($i = 0; $i < count($vectorA); $i++) {
            $dotProduct += $vectorA[$i] * $vectorB[$i];
            $normA += $vectorA[$i] * $vectorA[$i];
            $normB += $vectorB[$i] * $vectorB[$i];
        }

        $normA = sqrt($normA);
        $normB = sqrt($normB);

        if ($normA == 0.0 || $normB == 0.0) {
            return 0.0;
        }

        return $dotProduct / ($normA * $normB);
    }

    /**
     * Batch generate embeddings for multiple texts
     * 
     * @param array $texts Array of texts to embed
     * @return array Array of embeddings (null for failed embeddings)
     */
    public function batchGenerateEmbeddings(array $texts): array
    {
        $embeddings = [];
        
        foreach ($texts as $index => $text) {
            $embeddings[$index] = $this->generateEmbedding($text);
            
            // Add small delay to respect API rate limits
            if (count($texts) > 1) {
                usleep(100000); // 0.1 second delay
            }
        }
        
        return $embeddings;
    }

    /**
     * Check if the service is properly configured
     * 
     * @return bool True if API key is configured
     */
    public function isConfigured(): bool
    {
        return !empty($this->apiKey);
    }

    /**
     * Test the API connection
     * 
     * @return bool True if API is accessible
     */
    public function testConnection(): bool
    {
        $testEmbedding = $this->generateEmbedding('test connection');
        return $testEmbedding !== null;
    }
}