<?php

require_once 'vendor/autoload.php';

use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Http;
use App\Services\AIEmbeddingService;
use App\Http\Controllers\AIRecommendationController;
use App\Models\User;
use App\Models\GigJob;
use App\Models\GigWorker;

// Bootstrap Laravel
$app = require_once 'bootstrap/app.php';
$app->make('Illuminate\Contracts\Console\Kernel')->bootstrap();

echo "🚀 Testing AI Recommendation Endpoints...\n\n";

// 1. Test AI Embedding Service
echo "1. Testing AI Embedding Service...\n";
try {
    $service = new AIEmbeddingService();
    $embedding = $service->generateEmbedding('PHP Laravel developer with React experience');
    
    if ($embedding && count($embedding) > 0) {
        echo "   ✅ Embedding generation: SUCCESS (" . count($embedding) . " dimensions)\n";
    } else {
        echo "   ❌ Embedding generation: FAILED\n";
    }
} catch (Exception $e) {
    echo "   ❌ Embedding service error: " . $e->getMessage() . "\n";
}

// 2. Test job recommendations for gig workers
echo "\n2. Testing job recommendations for gig workers...\n";
try {
    // Get a sample gig worker
    $gigWorker = User::where('user_type', 'gig_worker')->first();
    
    if ($gigWorker) {
        echo "   📋 Testing with gig worker: {$gigWorker->name} (ID: {$gigWorker->id})\n";
        
        // Create controller instance with dependencies
        $aiService = new \App\Services\AIService();
        $embeddingService = new AIEmbeddingService();
        $aiJobMatchingService = new \App\Services\AIJobMatchingService($aiService);
        $controller = new AIRecommendationController($aiJobMatchingService, $embeddingService);
        
        // Mock request for gig worker
        $request = new \Illuminate\Http\Request();
        $request->setUserResolver(function () use ($gigWorker) {
            return $gigWorker;
        });
        
        // Test the getJobRecommendations method
        $response = $controller->getJobRecommendations($request);
        
        if ($response->getStatusCode() === 200) {
            $data = json_decode($response->getContent(), true);
            echo "   ✅ Job recommendations: SUCCESS\n";
            echo "   📊 Recommendations count: " . count($data['recommendations'] ?? []) . "\n";
            echo "   🤖 AI powered: " . ($data['ai_powered'] ? 'YES' : 'NO') . "\n";
        } else {
            echo "   ❌ Job recommendations failed: HTTP " . $response->getStatusCode() . "\n";
        }
    } else {
        echo "   ⚠️  No gig workers found in database\n";
    }
} catch (Exception $e) {
    echo "   ❌ Job recommendations error: " . $e->getMessage() . "\n";
}

// 3. Test worker recommendations for employers
echo "\n3. Testing worker recommendations for employers...\n";
try {
    // Get a sample employer and job
    $employer = User::where('user_type', 'employer')->first();
    $job = GigJob::first();
    
    if ($employer && $job) {
        echo "   👔 Testing with employer: {$employer->name} (ID: {$employer->id})\n";
        echo "   💼 Testing with job: {$job->title} (ID: {$job->id})\n";
        
        // Create controller instance with dependencies
        $aiService = new \App\Services\AIService();
        $embeddingService = new AIEmbeddingService();
        $aiJobMatchingService = new \App\Services\AIJobMatchingService($aiService);
        $controller = new AIRecommendationController($aiJobMatchingService, $embeddingService);
        
        // Mock request for employer
        $request = new \Illuminate\Http\Request();
        $request->setUserResolver(function () use ($employer) {
            return $employer;
        });
        
        // Test the getWorkerRecommendations method
        $response = $controller->getWorkerRecommendations($request, $job->id);
        
        if ($response->getStatusCode() === 200) {
            $data = json_decode($response->getContent(), true);
            echo "   ✅ Worker recommendations: SUCCESS\n";
            echo "   📊 Recommendations count: " . count($data['recommendations'] ?? []) . "\n";
            echo "   🤖 AI powered: " . ($data['ai_powered'] ? 'YES' : 'NO') . "\n";
        } else {
            echo "   ❌ Worker recommendations failed: HTTP " . $response->getStatusCode() . "\n";
        }
    } else {
        echo "   ⚠️  No employers or jobs found in database\n";
    }
} catch (Exception $e) {
    echo "   ❌ Worker recommendations error: " . $e->getMessage() . "\n";
}

// 4. Test similarity calculations
echo "\n4. Testing similarity calculations...\n";
try {
    $service = new AIEmbeddingService();
    
    // Test skill similarity
    $phpEmbedding = $service->generateEmbedding('PHP developer');
    $laravelEmbedding = $service->generateEmbedding('Laravel developer');
    $reactEmbedding = $service->generateEmbedding('React developer');
    
    if ($phpEmbedding && $laravelEmbedding && $reactEmbedding) {
        $phpLaravelSim = $service->cosineSimilarity($phpEmbedding, $laravelEmbedding);
        $phpReactSim = $service->cosineSimilarity($phpEmbedding, $reactEmbedding);
        
        echo "   ✅ Similarity calculations: SUCCESS\n";
        echo "   📈 PHP vs Laravel: " . round($phpLaravelSim, 4) . "\n";
        echo "   📈 PHP vs React: " . round($phpReactSim, 4) . "\n";
        echo "   💡 Expected: Laravel should be more similar to PHP than React\n";
    } else {
        echo "   ❌ Could not generate embeddings for similarity test\n";
    }
} catch (Exception $e) {
    echo "   ❌ Similarity test error: " . $e->getMessage() . "\n";
}

// 5. Test database integration
echo "\n5. Testing database integration...\n";
try {
    // Check if skill embeddings table exists and has data
    $skillEmbeddingsCount = \DB::table('skill_embeddings')->count();
    echo "   📊 Skill embeddings in database: {$skillEmbeddingsCount}\n";
    
    if ($skillEmbeddingsCount === 0) {
        echo "   ⚠️  No skill embeddings found. Running migration to populate...\n";
        
        // Try to populate some basic skill embeddings
        $basicSkills = ['PHP', 'Laravel', 'React', 'JavaScript', 'Python', 'Node.js'];
        $service = new AIEmbeddingService();
        
        foreach ($basicSkills as $skill) {
            $embedding = $service->generateEmbedding($skill);
            if ($embedding) {
                \DB::table('skill_embeddings')->insert([
                    'skill_name' => $skill,
                    'embedding' => json_encode($embedding),
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
                echo "   ✅ Added embedding for: {$skill}\n";
            }
        }
        
        $newCount = \DB::table('skill_embeddings')->count();
        echo "   📊 Total skill embeddings now: {$newCount}\n";
    }
} catch (Exception $e) {
    echo "   ❌ Database integration error: " . $e->getMessage() . "\n";
}

echo "\n🎯 AI Endpoint Testing Completed!\n";
echo "📋 Summary:\n";
echo "   - Embedding Service: Tested\n";
echo "   - Job Recommendations: Tested\n";
echo "   - Worker Recommendations: Tested\n";
echo "   - Similarity Calculations: Tested\n";
echo "   - Database Integration: Tested\n";